// Panelset class
// -----------------------------------------------------------------------------
export class OUIPanelsetElement extends HTMLElement {
    #internals = createInternals(this);
    get affordance() {
        return this.#internals.affordance;
    }
    set affordance(value) {
        this.#internals.affordance = value;
    }
    getActivePanels() {
        return this.#internals.getActivePanels();
    }
    connectedCallback() {
        window.addEventListener('hashchange', this.#internals.onHashChange);
        requestAnimationFrame(() => this.#internals.onHashChange({ currentTarget: window }));
    }
    disconnectedCallback() {
        window.removeEventListener('hashchange', this.#internals.onHashChange);
    }
}
// Panelset internals factory
// -----------------------------------------------------------------------------
let createInternals = (host) => {
    /** Current affordance, which is 'content', 'disclosure', or 'tabset'. */
    let affordance = 'content';
    // LightDOM references
    // -------------------------------------------------------------------------
    /** Panelset LightDOM live child nodes. */
    let hostChildNodes = host.childNodes;
    /** Panelset LightDOM computed style. */
    let hostComputedStyle = getComputedStyle(host);
    // ShadowDOM references
    // -------------------------------------------------------------------------
    /** Panelset ShadowDOM root. */
    let shadowRoot = host.attachShadow({ mode: 'closed', slotAssignment: 'manual' });
    /** Panelset ShadowDOM container of all content. */
    let shadowContents = createElement('div', { part: 'contents' });
    /** Panelset ShadowDOM container of all default styles (used in tabbed affordance"). */
    let shadowStyle = createElement('style');
    /** Panelset ShadowDOM container of all panel labels. */
    let shadowLabelset = createElement('div', { part: 'labelset is-tabset' });
    /** Panelset ShadowDOM container of all panel contents. */
    let shadowContentset = createElement('div', { part: 'contentset is-tabset' });
    // ShadowDOM styles
    // -------------------------------------------------------------------------
    // include the following default syles
    shadowStyle.append(
    // default styles for all affordances
    ':where(div){outline:none}', ':where(button){all:unset;outline:revert}', ':where(svg){display:none}', ':where([part~="content"]:not([part~="open"])){display:none}', 
    // default styles for the content affordance
    ':where([part~="is-content"]){display:contents}', 
    // default styles for the disclosure affordance
    ':where([part~="is-disclosure"][part~="section"]){display:flex;flex-direction:column}', ':where([part~="is-disclosure"][part~="label"]){align-items:center;display:flex;gap:.25em;padding-inline-end:1em}', ':where([part~="is-disclosure"][part~="marker"]){display:block;height:.75em;width:.75em;transform:rotate(90deg)}', ':where([part~="is-disclosure"][part~="marker"][part~="open"]){transform:rotate(180deg)}', 
    // default styles for the tabset affordance
    ':where([part~="is-tabset"][part~="labelset"]){display:flex;gap:1em}', ':where([part~="is-tabset"][part~="label"][part~="open"]) ::slotted(*){text-decoration:underline}');
    // ShadowDOM tree
    // -------------------------------------------------------------------------
    // append content and style containers to the ShadowDOM root
    shadowRoot.append(shadowContents, shadowStyle);
    // Panel references
    // -------------------------------------------------------------------------
    /** Array of all panels in the panelset. */
    let panels = [];
    /** Panel that was most recently activated. */
    let mostRecentPanel;
    /** WeakMap from a slotted label to a panel. */
    let panelBySlottedLabel = new WeakMap;
    /** WeakMap from a shadow label to a panel. */
    let panelByShadowLabel = new WeakMap;
    // ShadowDOM events
    // -------------------------------------------------------------------------
    /** Run whenever the shadow label is clicked. */
    let onclick = (event) => {
        panelToggledCallback(panelByShadowLabel.get(event.currentTarget));
    };
    /** Run whenever the shadow label receives keyboard input while focused. */
    let onkeydown = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'ArrowLeft':
                onkeydownwithfocusmove(event, 'prev');
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                onkeydownwithfocusmove(event, 'next');
                break;
        }
    };
    /** Run whenever the shadow label receives keyboard input to move the focus. */
    let onkeydownwithfocusmove = (event, move) => {
        // stop the event
        event.preventDefault();
        event.stopImmediatePropagation();
        /** Panel being focused from. */
        let currentPanel = panelByShadowLabel.get(event.currentTarget);
        /** Panel being focused to, or null if there is none. */
        let siblingPanel = currentPanel[move];
        // if there is a panel to focus to
        if (siblingPanel) {
            // focus that panel label
            siblingPanel.shadow.label.focus();
            // conditionally toggle that panel
            if (affordance === 'tabset') {
                panelToggledCallback(siblingPanel);
            }
        }
    };
    // Panelset callbacks
    // -------------------------------------------------------------------------
    /** Run whenever nodes are added to or removed from the panelset host. */
    let childrenChangedCallback = () => {
        /** Panel extracted from the Panelset LightDOM child nodes. */
        let panel = Object({ slotted: { content: [] } });
        /** Previously extracted Panel. */
        let prevPanel;
        /** Current Panel index. */
        let index = 0;
        // clear the current array of all panels in the panelset
        panels.splice(0);
        for (let node of hostChildNodes) {
            if (node instanceof HTMLHeadingElement) {
                panel = panelBySlottedLabel.get(node);
                if (!panel) {
                    // add a new panel, if the child node is a heading
                    panel = {
                        index,
                        open: false,
                        slotted: {
                            label: node,
                            content: [],
                        },
                        shadow: {
                            /** Section (`<div part="section">`). */
                            section: createElement('div', { part: 'section' }),
                            /** Label (`<button part="label">`). */
                            label: createElement('button', { part: 'label', type: 'button' }),
                            labelSlot: createElement('slot'),
                            /** Marker (`<svg part="marker">`). */
                            marker: createElement('svg', { part: 'marker', viewBox: '0 0 270 240', xmlns: 'http://www.w3.org/2000/svg' }),
                            /** Content (`<div part="content">`). */
                            content: createElement('div', { part: 'content', role: 'region', tabindex: 0 }),
                            contentSlot: createElement('slot'),
                        },
                        prev: null,
                        next: null,
                    };
                    setProps(panel.shadow.label, { onclick, onkeydown });
                    panel.shadow.marker.append(createElement('polygon', { points: '5,235 135,10 265,235', xmlns: 'http://www.w3.org/2000/svg' }));
                    panel.shadow.label.append(panel.shadow.marker, panel.shadow.labelSlot);
                    panel.shadow.content.append(panel.shadow.contentSlot);
                    panelBySlottedLabel.set(node, panel);
                    panelByShadowLabel.set(panel.shadow.label, panel);
                }
                // update the current label shadow dom
                setAttributes(panel.shadow.label, { id: 'label-' + index, 'aria-controls': 'content-' + index });
                setAttributes(panel.shadow.labelSlot, { name: 'label-' + index });
                setAttributes(panel.shadow.content, { id: 'content-' + index, 'aria-labelledby': 'label-' + index });
                setAttributes(panel.shadow.contentSlot, { name: 'content-' + index });
                // bump the index using the current size of the panels array
                index = panels.push(panel);
                // conditionally link the previous and current panels
                if (prevPanel) {
                    panel.prev = prevPanel;
                    prevPanel.next = panel;
                }
                prevPanel = panel;
                // conditionally define the most recent panel as an open panel
                if (!mostRecentPanel) {
                    mostRecentPanel = panel;
                    panel.open = true;
                }
            }
            else if (node instanceof Element || node instanceof Text) {
                // otherwise, append the child node to the existing panel
                panel.slotted.content.push(node);
            }
        }
        affordanceChangedCallback();
    };
    /** Run whenever the panelset affordance is changed. */
    let affordanceChangedCallback = () => {
        setAttributes(shadowContents, { part: withAffordance('contents') });
        if (affordance === 'tabset') {
            shadowContents.replaceChildren(shadowLabelset, shadowContentset);
        }
        else {
            shadowContents.replaceChildren();
        }
        for (let panel of panels) {
            setAttributes(panel.shadow.section, { part: withAffordance('section') });
            setAttributes(panel.shadow.label, { part: withAffordance('label') });
            setAttributes(panel.shadow.marker, { part: withAffordance('marker') });
            setAttributes(panel.shadow.content, { part: withAffordance('content') });
            panel.shadow.label.removeAttribute('tabindex');
            panel.shadow.label.removeAttribute('aria-expanded');
            panel.shadow.label.removeAttribute('aria-selected');
            panel.shadow.content.removeAttribute('tabindex');
            switch (affordance) {
                case 'content': {
                    panel.shadow.content.part.toggle('open', true);
                    panel.shadow.section.replaceChildren(panel.shadow.label, panel.shadow.content);
                    shadowContents.append(panel.shadow.section);
                    assignSlot(panel.shadow.labelSlot, panel.slotted.label);
                    assignSlot(panel.shadow.contentSlot, ...panel.slotted.content);
                    break;
                }
                case 'disclosure': {
                    setAttributes(panel.shadow.label, {
                        'aria-expanded': panel.open,
                        tabindex: 0
                    });
                    setAttributes(panel.shadow.content, {
                        tabindex: 0
                    });
                    panel.shadow.content.part.toggle('open', panel.open);
                    panel.shadow.label.part.toggle('open', panel.open);
                    panel.shadow.marker.part.toggle('open', panel.open);
                    panel.shadow.section.replaceChildren(panel.shadow.label, panel.shadow.content);
                    shadowContents.append(panel.shadow.section);
                    assignSlot(panel.shadow.labelSlot, panel.slotted.label);
                    assignSlot(panel.shadow.contentSlot, ...panel.slotted.content);
                    break;
                }
                case 'tabset': {
                    panel.open = mostRecentPanel === panel;
                    setAttributes(panel.shadow.label, {
                        'aria-selected': panel.open,
                        tabindex: panel.open ? 0 : -1
                    });
                    setAttributes(panel.shadow.content, {
                        tabindex: 0
                    });
                    panel.shadow.label.part.toggle('open', panel.open);
                    panel.shadow.content.part.toggle('open', panel.open);
                    shadowLabelset.append(panel.shadow.label);
                    shadowContentset.append(panel.shadow.content);
                    assignSlot(panel.shadow.labelSlot, panel.slotted.label);
                    assignSlot(panel.shadow.contentSlot, ...panel.slotted.content);
                    break;
                }
            }
        }
        // dispatch an affordancechange event for the panel
        host.dispatchEvent(new CustomEvent('affordancechange', {
            detail: {
                affordance,
            }
        }));
    };
    /** Run whenever the given panel is toggled. */
    let panelToggledCallback = (toggledPanel) => {
        let { open } = toggledPanel;
        switch (affordance) {
            case 'disclosure': {
                open = toggledPanel.open = !open;
                toggledPanel.shadow.section.part.toggle('open', open);
                toggledPanel.shadow.label.part.toggle('open', open);
                toggledPanel.shadow.marker.part.toggle('open', open);
                toggledPanel.shadow.content.part.toggle('open', open);
                break;
            }
            case 'tabset': {
                if (toggledPanel.open) {
                    return;
                }
                for (let panel of panels) {
                    let open = panel.open = panel === toggledPanel;
                    panel.shadow.label.tabIndex = open ? 0 : -1;
                    setAttributes(panel.shadow.label, { 'aria-selected': open });
                    panel.shadow.section.part.toggle('open', open);
                    panel.shadow.label.part.toggle('open', open);
                    panel.shadow.marker.part.toggle('open', open);
                    panel.shadow.content.part.toggle('open', open);
                }
                break;
            }
        }
        // conditionally update the most recent panel if the panel is opened
        if (toggledPanel.open) {
            mostRecentPanel = toggledPanel;
        }
        // dispatch an open event for the panel
        host.dispatchEvent(new CustomEvent('open', {
            detail: {
                label: toggledPanel.slotted.label,
                content: toggledPanel.slotted.content.slice(0),
            }
        }));
    };
    // Utilities
    // -------------------------------------------------------------------------
    /** Returns the given part identifier and the current affordance. */
    let withAffordance = (identifier) => identifier + ' is-' + affordance;
    // Handle changes to any DOM child nodes
    // -------------------------------------------------------------------------
    new MutationObserver(childrenChangedCallback);
    if (host.hasChildNodes())
        childrenChangedCallback();
    // Handle changes to the page hash
    // -------------------------------------------------------------------------
    window.addEventListener('hashchange', (event) => {
        // ...
    });
    // Handle changes to the CSS --affordance property
    // -------------------------------------------------------------------------
    let oldValue = affordance;
    let newValue = '';
    let frameA = () => {
        requestAnimationFrame(frameB);
        newValue = hostComputedStyle.getPropertyValue('--affordance');
    };
    let frameB = () => {
        requestAnimationFrame(frameA);
        if (oldValue !== newValue) {
            oldValue = newValue;
            internals.affordance = newValue.trim() || 'content';
        }
    };
    frameA();
    // Internals
    // -------------------------------------------------------------------------
    let internals = {
        get affordance() {
            return affordance;
        },
        set affordance(value) {
            value = value.toLowerCase();
            if (value === 'disclosure' || value === 'tabset' || value === 'content') {
                if (value !== affordance) {
                    affordance = value;
                    affordanceChangedCallback();
                }
            }
        },
        getActivePanels() {
            let activePanels = [];
            for (let panel of panels) {
                if (panel.open) {
                    activePanels.push({
                        label: panel.slotted.label,
                        content: panel.slotted.content.slice(0),
                    });
                }
            }
            return activePanels;
        },
        onHashChange(event) {
            let hash = event.currentTarget.location.hash;
            if (hash) {
                let element = document.querySelector(hash);
                if (element) {
                    for (let panel of panels) {
                        if (panel.slotted.label.contains(element)) {
                            console.log(panel);
                            panelToggledCallback(panel);
                            return;
                        }
                        for (let content of panel.slotted.content) {
                            if (content.contains(element)) {
                                console.log(panel);
                                panelToggledCallback(panel);
                                return;
                            }
                        }
                    }
                }
            }
        },
    };
    return internals;
};
// Utilities
// -----------------------------------------------------------------------------
/** Assigns to the given slot the given nodes (using manual slot assignment when supported). */
let assignSlot = (slot, ...nodes) => {
    if (supportsSlotAssignment) {
        slot.assign(...nodes);
    }
    else {
        for (let node of nodes) {
            if (node instanceof Element) {
                setAttributes(node, { slot: slot.name });
            }
        }
    }
};
/** Whether slot assignment is supported by the current browser. */
let supportsSlotAssignment = typeof HTMLSlotElement === 'function' && typeof HTMLSlotElement.prototype.assign === 'function';
/** Returns a new element specified by the given tag name with the given attributes. */
let createElement = (name, attrs = null) => {
    let xmlns = attrs && attrs.xmlns || 'http://www.w3.org/1999/xhtml';
    let element = document.createElementNS(attrs && delete attrs.xmlns && xmlns || 'http://www.w3.org/1999/xhtml', name);
    return setAttributes(element, attrs);
};
/** Returns the given element with the given attributes set. */
let setAttributes = (element, props) => {
    for (let prop in props) {
        element.setAttribute(prop, props[prop]);
    }
    return element;
};
/** Returns the given object with the given properties set. */
let setProps = Object.assign;
