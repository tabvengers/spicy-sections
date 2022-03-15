import './polyfill.js'

// element
// -----------------------------------------------------------------------------

export class OUIPanelset extends HTMLElement {
	#shadow = h(this.attachShadow({ mode: 'open', slotAssignment: 'manual' }), null,
		h('style', {
			textContent: (
				'[part~="label"]{display:block}' +
				'[part~="panel"]:not([part~="open"]){display:none}'
			)
		})
	)

	connectedCallback() {
		createCollapseAffordance(this, this.#shadow)
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

const createCollapseAffordance = (host, root) => {
	const panels = getContentPanels(host)
	const container = root.appendChild(
		h('div', { part: 'container collapse' })
	)

	for (const [ labelNode, ...panelNodes ] of panels) {
		const labelSlot = h('slot')
		const panelSlot = h('slot')

		const labelButton = h('button', { part: 'label collapse', onclick(event) {
			labelButton.part.toggle('open')
			panelGroup.part.toggle('open')
		} }, labelSlot)
		const panelGroup = h('div', { part: 'panel collapse' }, panelSlot)

		container.append(labelButton, panelGroup)

		labelSlot.assign(labelNode)
		panelSlot.assign(...panelNodes)
	}
}

// utilities
// -----------------------------------------------------------------------------

/** Returns the given element or generated element with any properties, attributes, or children. */
const h = (
	/** @type {Element | string} */
	target,
	/** @type {Record<string, any>} */
	props,
	/** @type {(Element | string)[]} */
	...children
) => {
	const element = typeof target === 'string' ? document.createElement(target) : target

	for (const name in props) {
		if (props[name] == null) {
			element.removeAttribute(toDashedCase(name))
		} else if (name in element) {
			element[name] = props[name]
		} else {
			element.setAttribute(toDashedCase(name), props[name])
		}
	}

	element.append(...children)

	return element
}

const toDashedCase = (/** @type {string} */ value) => value.replace(/[A-Z]/g, '-$&').toLowerCase()

/** @typedef {[ Element, ...Element[] ]} PanelOfLightDOM */
/** @typedef {PanelOfLightDOM[]} PanelsetOfLightDOM */
