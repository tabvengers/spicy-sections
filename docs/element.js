// Panelset class
// -----------------------------------------------------------------------------
export class OUIPanelsetElement extends HTMLElement {
    #internals = createInternals(this);
    get affordance() {
        return this.#internals.getAffordance();
    }
    set affordance(value) {
        this.#internals.setAffordance(String(value));
    }
    getPanels() {
        return this.#internals.getPanels();
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
    // ShadowDOM tree for container:
    //
    // <div part="container"><!-- affordance tree --></div>
    // <style><!-- default styles --></style>
    // ShadowDOM tree for the "content" affordance:
    //
    // <div part="section">
    //   <div part="label">
    //     <slot><!-- slotted panel label --></slot>
    //   </div>
    //   <div part="content">
    //     <slot><!-- slotted panel contents --></slot>
    //   </div>
    // </div>
    // ShadowDOM tree for the "disclosure" affordance:
    //
    // <div part="section">
    //   <div part="label">
    //     <slot><!-- slotted panel label --></slot>
    //   </div>
    //   <div part="content">
    //     <slot><!-- slotted panel contents --></slot>
    //   </div>
    // </div>
    // ShadowDOM tree for the "tabset" affordance:
    //
    // <div part="label-container">
    //   <!-- for each panel -->
    //   <div part="label">
    //     <slot><!-- slotted panel label --></slot>
    //   </div>
    // </div>
    // <div part="content-container">
    //   <!-- for each panel -->
    //   <div part="content">
    //     <slot><!-- slotted panel contents --></slot>
    //   </div>
    // </div>
    /** Panelset ShadowDOM root. */
    let shadowRoot = host.attachShadow({ mode: 'closed', slotAssignment: 'manual' });
    /** Panelset ShadowDOM container of all ShadowDOM content. */
    let shadowContainerElement = createElement('div', { part: 'container' });
    /** Panelset ShadowDOM container of all default styles (used in tabbed affordance"). */
    let shadowStyleElement = createElement('style');
    /** Panelset ShadowDOM container of all panel labels. */
    let shadowLabelContainerElement = createElement('div', { part: 'label-container is-tabset', role: 'tablist' });
    /** Panelset ShadowDOM container of all panel contents. */
    let shadowContentContainerElement = createElement('div', { part: 'content-container is-tabset' });
    // ShadowDOM styles
    // -------------------------------------------------------------------------
    // include the following default syles
    shadowStyleElement.append(
    // default styles for all affordances
    ':host{--affordance:content;--affordance:' + (host.getAttribute('affordance') || 'content') + '}', ':where(div){display:contents}', ':where(svg){display:none}', ':where([part~="content"]){outline:unset}', ':where([part~="content"]:not([part~="open"])){display:none}', 
    // default styles for the disclosure affordance
    ':where([part~="is-disclosure"][part~="section"]){display:flex;flex-direction:column}', ':where([part~="is-disclosure"][part~="label"]){align-items:center;display:flex;gap:.25em;padding-inline-end:1em}', ':where([part~="is-disclosure"][part~="marker"]){display:block;height:.75em;width:.75em;transform:rotate(90deg)}', ':where([part~="is-disclosure"][part~="marker"][part~="open"]){transform:rotate(180deg)}', 
    // default styles for the tabset affordance
    ':where([part~="is-tabset"][part~="label-container"]){display:flex;gap:1em}', ':where([part~="is-tabset"]:is([part~="label"],[part~="content"][part~="open"])){display:block}', ':where([part~="is-tabset"][part~="label"][part~="open"]) ::slotted(*){text-decoration:underline}');
    // ShadowDOM tree
    // -------------------------------------------------------------------------
    // append content and style containers to the ShadowDOM root
    shadowRoot.append(shadowContainerElement, shadowStyleElement);
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
        switch (lastKeydownCode = event.code) {
            case 'ArrowUp':
            case 'ArrowLeft':
                onkeydownwithfocusmove(event, 'prev');
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                onkeydownwithfocusmove(event, 'next');
                break;
            case 'Space':
                event.preventDefault();
                break;
            case 'Enter':
                event.preventDefault();
                panelToggledCallback(panelByShadowLabel.get(event.currentTarget));
        }
    };
    let onkeyup = (event) => {
        if (event.code === 'Space' && lastKeydownCode === 'Space') {
            event.preventDefault();
            panelToggledCallback(panelByShadowLabel.get(event.currentTarget));
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
    /** Code value of the most recent keydown event. */
    let lastKeydownCode;
    // Panelset callbacks
    // -------------------------------------------------------------------------
    /** Run whenever nodes are added to or removed from the panelset host. */
    let childrenChangedCallback = () => {
        /** Panel extracted from the Panelset LightDOM child nodes. */
        let panel = Object({ slotted: { contents: [] } });
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
                            contents: [],
                        },
                        shadow: {
                            /** Section (`<div part="section">`). */
                            section: createElement('div'),
                            /** Label (`<div part="label">`). */
                            label: createElement('div', { part: '' }),
                            labelSlot: createElement('slot'),
                            /** Marker (`<svg part="marker">`). */
                            marker: createElement('svg', { part: '', viewBox: '0 0 270 240', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' }),
                            /** Content (`<div part="content">`). */
                            content: createElement('div', { part: '' }),
                            contentSlot: createElement('slot'),
                        },
                        prev: null,
                        next: null,
                    };
                    setProps(panel.shadow.label, { onclick, onkeydown, onkeyup });
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
                panel.slotted.contents.push(node);
            }
        }
        affordanceChangedCallback();
    };
    /** Run whenever the panelset affordance is changed. */
    let affordanceChangedCallback = () => {
        // set the container affordance
        setAttributes(shadowContainerElement, { part: 'container is-' + affordance });
        // reset any container children
        if (affordance === 'tabset') {
            shadowContainerElement.replaceChildren(shadowLabelContainerElement, shadowContentContainerElement);
        }
        else {
            shadowContainerElement.replaceChildren();
        }
        for (let panel of panels) {
            // update all panel parts with the new affordance
            setAttributes(panel.shadow.section, { part: 'section is-' + affordance });
            setAttributes(panel.shadow.label, { part: 'label is-' + affordance, role: null, tabindex: null, 'aria-expanded': null, 'aria-selected': null });
            setAttributes(panel.shadow.marker, { part: 'marker is-' + affordance });
            setAttributes(panel.shadow.content, { part: 'content is-' + affordance, tabindex: null });
            // by affordance; update attributes, parts, shadow tree
            switch (affordance) {
                case 'content': {
                    // update parts
                    panel.shadow.content.part.toggle('open', true);
                    // update shadow tree
                    panel.shadow.section.replaceChildren(panel.shadow.label, panel.shadow.content);
                    shadowContainerElement.append(panel.shadow.section);
                    break;
                }
                case 'disclosure': {
                    // update attributes
                    setAttributes(panel.shadow.label, { role: 'button', 'aria-expanded': panel.open, tabindex: 0 });
                    // update parts
                    panel.shadow.content.part.toggle('open', panel.open);
                    panel.shadow.label.part.toggle('open', panel.open);
                    panel.shadow.marker.part.toggle('open', panel.open);
                    // update shadow tree
                    panel.shadow.section.replaceChildren(panel.shadow.label, panel.shadow.content);
                    shadowContainerElement.append(panel.shadow.section);
                    break;
                }
                case 'tabset': {
                    panel.open = mostRecentPanel === panel;
                    // update attributes
                    setAttributes(panel.shadow.label, { role: 'tab', 'aria-selected': panel.open, tabindex: panel.open ? 0 : -1 });
                    setAttributes(panel.shadow.content, { role: 'tabpanel', tabindex: 0 });
                    // update parts
                    panel.shadow.label.part.toggle('open', panel.open);
                    panel.shadow.content.part.toggle('open', panel.open);
                    // update shadow tree
                    shadowLabelContainerElement.append(panel.shadow.label);
                    shadowContentContainerElement.append(panel.shadow.content);
                    break;
                }
            }
            // update assignments
            assignSlot(panel.shadow.labelSlot, panel.slotted.label);
            assignSlot(panel.shadow.contentSlot, ...panel.slotted.contents);
        }
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
                setAttributes(toggledPanel.shadow.label, { 'aria-expanded': open });
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
        host.dispatchEvent(new CustomEvent('toggle', {
            detail: {
                open: toggledPanel.open,
                label: toggledPanel.slotted.label,
                contents: toggledPanel.slotted.contents.slice(0),
            }
        }));
    };
    // Internals
    // -------------------------------------------------------------------------
    let internals = {
        getAffordance() {
            return affordance;
        },
        setAffordance(value) {
            value = value.trim().toLowerCase();
            if (affordances.has(value)) {
                if (value !== affordance) {
                    affordance = value;
                    affordanceChangedCallback();
                    // dispatch an affordancechange event for the panel
                    host.dispatchEvent(new CustomEvent('affordancechange', {
                        detail: {
                            affordance,
                        }
                    }));
                }
            }
        },
        getPanels() {
            return panels.map(panel => ({
                open: panel.open,
                label: panel.slotted.label,
                contents: panel.slotted.contents.slice(0),
            }));
        },
    };
    // Handle changes to any DOM child nodes
    // -------------------------------------------------------------------------
    let observer = new MutationObserver(childrenChangedCallback);
    // Handle changes to the page hash
    // -------------------------------------------------------------------------
    window.addEventListener('hashchange', () => {
        if (!host.isConnected)
            return;
        let { hash } = window.location;
        if (hash) {
            let element = document.querySelector(hash);
            if (element) {
                for (let panel of panels) {
                    if (panel.slotted.label.contains(element)) {
                        panelToggledCallback(panel);
                        return;
                    }
                    for (let content of panel.slotted.contents) {
                        if (content.contains(element)) {
                            panelToggledCallback(panel);
                            return;
                        }
                    }
                }
            }
        }
    });
    // Handle changes to the CSS --affordance property
    // -------------------------------------------------------------------------
    let oldCSSValue = '';
    let newCSSValue = '';
    let frameA = () => {
        requestAnimationFrame(frameB);
        newCSSValue = hostComputedStyle.getPropertyValue('--affordance');
    };
    let frameB = () => {
        requestAnimationFrame(frameA);
        if (oldCSSValue !== newCSSValue) {
            internals.setAffordance(oldCSSValue = newCSSValue);
        }
    };
    // initialize
    // -------------------------------------------------------------------------
    // activate the CSS --affordance property observer
    frameA();
    // format the initial --affordance property value
    newCSSValue = oldCSSValue = newCSSValue.trim().toLowerCase();
    // conditionally update the affordance by the `--affordance` property value
    if (affordances.has(newCSSValue)) {
        affordance = newCSSValue;
    }
    // observe the host for changes
    observer.observe(host, { childList: true });
    // initialize the current children
    childrenChangedCallback();
    return internals;
};
// Utilities
// -----------------------------------------------------------------------------
let affordances = new Set(['disclosure', 'tabset', 'content']);
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
        if (props[prop] === null) {
            element.removeAttribute(prop);
        }
        else {
            element.setAttribute(prop, props[prop]);
        }
    }
    return element;
};
/** Returns the given object with the given properties set. */
let setProps = Object.assign;
