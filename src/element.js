// @ts-check

import './polyfill.js'

// element
// -----------------------------------------------------------------------------

export class OUIPanelset extends HTMLElement {
	#shadow = h(this.attachShadow({ mode: 'open', slotAssignment: 'manual' }), null,
		h('style', {
			textContent: (
				':where([part~="labels"]){display:flex;gap:1em}' +
				':where([part~="label"]){all:unset;display:block}' +
				':where([part~="label"][part~="collapse"]){width:100%}' +
				':where([part~="panel"]:not([part~="open"])){display:none}' +
				':where(:focus){outline:revert}'
			)
		})
	)

	/** @type {'collapse' | 'exclusive-collapse' | 'tab-bar'} */
	#affordance

	connectedCallback() {
		if (this.#affordance === undefined) {
			this.affordance = this.affordance
			this.affordance = /** @type {AffordanceType} */ (this.getAttribute('affordance'))
		}
	}

	get affordance() {
		return this.#affordance || (this.#affordance = 'collapse')
	}

	set affordance(value) {
		const normalizedValue = String(value).toLowerCase()

		if (normalizedValue === 'collapse' || normalizedValue === 'exclusive-collapse' || normalizedValue === 'tab-bar') {
			this.#affordance = normalizedValue

			assignAffordance[normalizedValue](this, this.#shadow)
		}
	}
}

// internals
// -----------------------------------------------------------------------------

const getContentPanels = ({ childNodes }) => {
	/** @type {PanelsetOfLightDOM} */
	const panelset = []

	/** @type {PanelOfLightDOM} */ // @ts-ignore
	let panel = []

	for (const childNode of childNodes) {
		if (childNode.slot !== undefined) h(childNode, { slot: null })

		if (childNode instanceof HTMLHeadingElement) {
			panelset.push(panel = [childNode])
		} else {
			panel.push(childNode)
		}
	}

	return panelset
}

/** @type {Record<AffordanceType, { (host: HTMLElement, root: ShadowRoot): void  }>} */
const assignAffordance = {
	'collapse'(host, root) {
		const panels = getContentPanels(host)
		const container = h('div', { part: 'container collapse' })
	
		root.append(container)
	
		for (const [ labelNode, ...panelNodes ] of panels) {
			const labelSlot = h('slot')
			const panelSlot = h('slot')
	
			const labelButton = h('button', { part: 'label collapse', onclick() {
				labelButton.part.toggle('open')
				panelGroup.part.toggle('open')
			} }, labelSlot)
			const panelGroup = h('div', { part: 'panel collapse' }, panelSlot)
	
			container.append(labelButton, panelGroup)
	
			labelSlot.assign(labelNode)
			panelSlot.assign(...panelNodes)
		}
	},
	'exclusive-collapse'(host, root) {},
	'tab-bar'(host, root) {
		const contents = getContentPanels(host)
		const labels = h('div', { part: 'labels' })
		const panels = h('div', { part: 'panels' })
		const container = h('div', { part: 'container tab-bar' }, labels, panels)

		h(root, null, container)

		for (const [ labelNode, ...panelNodes ] of contents) {
			const labelSlot = h('slot')
			const panelSlot = h('slot')

			const labelButton = h('button', { part: 'label tab-bar', onclick() {
				labelButton.part.toggle('open')
				panelGroup.part.toggle('open')
			} }, labelSlot)
			const panelGroup = h('div', { part: 'panel tab-bar' }, panelSlot)

			h(labels, null, labelButton)
			h(panels, null, panelGroup)

			labelSlot.assign(labelNode)
			panelSlot.assign(...panelNodes)
		}
	},
}

// utilities
// -----------------------------------------------------------------------------

/** Returns the given element or generated element with any properties, attributes, or children. */
/** @type {{ <T extends Node | string>(target: T, props?: Record<string, any>, ...children: (Node | string)[]): T extends 'button' ? HTMLButtonElement : T extends 'div' ? HTMLDivElement : T extends 'slot' ? HTMLSlotElement : T extends 'style' ? HTMLStyleElement : T extends string ? HTMLElement : T }} */
const h = (target, props, ...children) => {
	const element = typeof target === 'string' ? document.createElement(target) : target

	for (const name in props) {
		if (props[name] == null) {
			// @ts-ignore
			if ('removeAttribute' in element) {
				element.removeAttribute(toDashedCase(name))
			}
		// @ts-ignore
		} else if (name in element) {
			element[name] = props[name]
		// @ts-ignore
		} else if ('setAttribute' in element) {
			element.setAttribute(toDashedCase(name), props[name])
		}
	}

	// @ts-ignore
	element.append(...children)

	// @ts-ignore
	return element
}

const toDashedCase = (/** @type {string} */ value) => value.replace(/[A-Z]/g, '-$&').toLowerCase()

/** @typedef {[ Element, ...Element[] ]} PanelOfLightDOM */
/** @typedef {PanelOfLightDOM[]} PanelsetOfLightDOM */
/** @typedef {'collapse' | 'exclusive-collapse' | 'tab-bar'} AffordanceType */
