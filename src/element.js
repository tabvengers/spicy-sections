// @ts-check

// element
// -----------------------------------------------------------------------------

export class OUIPanelset extends HTMLElement {
	#internals = createInternals(this)

	get affordance() {
		return this.#internals.affordance
	}
}

// internals
// -----------------------------------------------------------------------------

const createInternals = (/** @type {HTMLElement} */ host) => {
	/** Panelset Shadow Root */
	const shadowRoot = host.attachShadow({ mode: 'open', slotAssignment: 'manual' })

	/** Panelset Container */
	const container = h.div({ part: 'container' })

	/** Panelset Default Styles */
	const defaultStyle = h.style(
		// default styles for all affordances
		':where(div){display:contents}',
		':where(button){all:unset;outline:revert}',
		':where(svg){display:none}',
		':where([part~="label-container"]){display:flex;gap:1em}',
		':where([part~="panel"]:not([part~="open"])){display:none}',

		// default styles for collapse affordance
		':where([part~="collapse"][part~="label"]){align-items:center;display:flex;gap:.25em}',
		':where([part~="collapse"][part~="marker"]){display:block;height:.75em;width:.75em;transform:rotate(90deg)}',
		':where([part~="collapse"][part~="marker"][part~="open"]){transform:rotate(180deg)}',

		// default styles for tab-bar affordance
		':where([part~="label"][part~="tab-bar"][part~="open"]) ::slotted(*){text-decoration:underline}'
	)

	const onclick = (/** @type {HTMLElementEventMap['click'] & { currentTarget: HTMLButtonElement }} */ event) => {
		if (internals.toggleSection(internals.sectionMap.get(event.currentTarget))) {
			host.dispatchEvent(new Event('toggle'))
		}
	}

	const onkeydown = (/** @type {HTMLElementEventMap['keydown'] & { currentTarget: HTMLButtonElement }} */ event) => {
		const section = internals.sectionMap.get(event.currentTarget)

		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowLeft':
				if (section.prev) {
					section.prev.label.element.focus()
				}

				break

			case 'ArrowDown':
			case 'ArrowRight':
				if (section.next) {
					section.next.label.element.focus()
				}

				break
		}
	}

	/** @type {Internals} */
	const internals = {
		affordance: 'tab-bar',
		sectionSet: [],
		sectionMap: new WeakMap(),
		addSection(contentSection) {
			/** Section Index. */
			const index = internals.sectionSet.length

			/** Section Label. */
			const label = /** @type {PaneledSection['label']} */ ({
				/** Label (`<button part="label">`). */
				element: h.button({ part: 'label', id: 'label-' + index, ariaControls: 'panel-' + index, onclick, onkeydown }),

				/** Marker (`<svg part="marker">`). */
				marker: h.svg({ part: 'marker', viewBox: '0 0 270 240' }, h.polygon({ points: '5,235 135,10 265,235' })),

				/** Slot (`<slot>`). */
				slot: h.slot({ name: 'label-' + index }),

				/** Slotted Element (`<h>`). */
				slotted: contentSection.label,
			})

			/** Section Panel. */
			const panel = /** @type {PaneledSection['panel']} */ ({
				/** Section Panel (`<div part="panel">`). */
				element: h.div({ part: 'panel', id: 'panel-' + index, ariaLabelledby: 'label-' + index }),

				/** Slot (`<slot>`). */
				slot: h.slot({ name: 'panel-' + index }),

				/** Slotted Panel Elements. */
				slotted: contentSection.panel,
			})

			// any previously added section
			const prev = internals.sectionSet[internals.sectionSet.length - 1] || null

			// create a new section (linked to any previous section)
			const section = /** @type {PaneledSection} */ ({ label, panel, open: false, prev, next: null })
	
			// link the new section to any previous section
			if (prev) prev.next = section
	
			// add the new section to the section set
			internals.sectionSet.push(section)

			// link the label element to the section
			internals.sectionMap.set(label.element, section)

			// append the label marker and label slot to the label element
			label.element.append(label.marker, label.slot)

			// append the panel slot to the panel element
			panel.element.append(panel.slot)

			return section
		},
		toggleSection(paneledSection) {
			switch (internals.affordance) {
				case 'collapse': {
					const open = paneledSection.open = !paneledSection.open

					paneledSection.label.element.part.toggle('open', open)
					paneledSection.label.marker.part.toggle('open', open)
					paneledSection.panel.element.part.toggle('open', open)

					return true
				}

				case 'tab-bar': {
					if (paneledSection.open) return false

					for (const eachPaneledSection of internals.sectionSet) {
						const open = eachPaneledSection === paneledSection

						eachPaneledSection.open = open

						h(eachPaneledSection.label.element, { tabIndex: open ? 0 : -1 })

						eachPaneledSection.label.element.part.toggle('open', open)
						eachPaneledSection.label.marker.part.toggle('open', open)
						eachPaneledSection.panel.element.part.toggle('open', open)
					}

					return true
				}
			}
		},
		initialize() {
			if (!host.isConnected) return

			const template = internals.templates[internals.affordance](container)

			for (const contentSection of getContentSections(host)) {
				const paneledSection = internals.addSection(contentSection)

				template.addSection(paneledSection)

				assignSlot(paneledSection.label.slot, paneledSection.label.slotted)
				assignSlot(paneledSection.panel.slot, ...paneledSection.panel.slotted)
			}
		},
		templates: {
			'collapse'(container) {
				h(container, { part: 'container collapse' })

				return {
					addSection(section) {
						h(section.label.element, { part: 'label collapse', tabIndex: null, ariaSelected: 'false' })
						h(section.label.marker, { part: 'marker collapse' })
						h(section.panel.element, { part: 'panel collapse' })

						container.append(section.label.element, section.panel.element)
					}
				}
			},
			'exclusive-collapse'(container) {
				container.part.value = 'container exclusive-collapse'

				return {
					addSection(section) {}
				}
			},
			'tab-bar'(container) {
				h(container, { part: 'container tab-bar' })

				const labelContainer = h.div({ part: 'label-container tab-bar', role: 'tablist' })
				const panelContainer = h.div({ part: 'panel-container tab-bar' })

				container.append(labelContainer, panelContainer)

				return {
					addSection(section) {
						const open = internals.sectionSet.length === 1
						const part = open ? ' open' : ''

						h(section.label.element, { part: 'label tab-bar' + part, role: 'tab', tabIndex: open ? 0 : -1, ariaSelected: String(!open) })
						h(section.label.marker, { part: 'marker tab-bar' + part })
						h(section.panel.element, { part: 'panel tab-bar' + part, role: 'tabpanel' })

						labelContainer.append(section.label.element)
						panelContainer.append(section.panel.element)
					}
				}
			},
		},
	}

	/** Observed used to re-initialize the panel affordance when the contents change. */
	const observer = new MutationObserver(internals.initialize)

	observer.observe(host, { childList: true })

	// add the panelset container to the panelset shadow root
	shadowRoot.append(container, defaultStyle)


	internals.initialize()

	return internals
}

// utilities
// -----------------------------------------------------------------------------

const toDashedCase = (/** @type {string} */ value) => value.replace(/[A-Z]/g, '-$&').toLowerCase()

const isWritableProp = (/** @type {any} */ value) => value === null || typeof value !== 'object'

const h = new Proxy(/** @type {CreateElement} */ ((/** @type {AnyElement | AnyElementName} */ target, /** @type {any} */ ...args) => {
	const element = typeof target === 'string' ? target === 'svg' || target === 'polygon' ? document.createElementNS('http://www.w3.org/2000/svg', target) : document.createElement(target) : target

	const isSVG = element instanceof SVGElement

	const props = typeof args[0] === 'object' && Object(args[0]).constructor === Object ? args.shift() : null

	for (const prop in props) {
		if (prop in element && isWritableProp(element[prop])) {
			element[prop] = props[prop]
		} else {
			element.setAttribute(isSVG ? prop : toDashedCase(prop), props[prop])
		}
	}

	element.append(...args)

	return element
}), {
	get(_, /** @type {string} */ name) {
		return (/** @type {any} */ ...args) => h(name, ...args)
	}
})

/** Returns sections of content extracted from `<oui-panelset>`. */
const getContentSections = (/** @type {HTMLElement} */ host) => {
	/** All child nodes of the panelset element. */
	let nodes = /** @type {AnyNode[]} */ (/** @type {any} */ (host.childNodes))

	/** All sections extracted from the panelset element. */
	let sections = /** @type {ContentSection[]} */ ([])

	/** Any section extracted from the panelset element. */
	let section = /** @type {ContentSection} */ ({ label: null, panel: [] })

	for (const node of nodes) {
		if (node instanceof HTMLHeadingElement) {
			// add a new section, if the child node is a heading
			sections.push(section = { label: node, panel: [] })
		} else {
			// otherwise, append the child node to the existing section
			section.panel.push(node)
		}

		// remove any existing slotting
		if (node instanceof Element) {
			node.removeAttribute('slot')
		}
	}

	return sections
}

/** Assigns to the given slot the given nodes (using manual slot assignment when supported). */
const assignSlot = (/** @type {HTMLSlotElement} */ slot, /** @type {AnyNode[]} */ ...nodes) => {
	if (typeof slot.assign === 'function') {
		slot.assign(...nodes)
	} else {
		for (const node of nodes) {
			if (node instanceof Element) {
				node.slot = slot.name
			}
		}
	}
}

/** @typedef {import('./element').AnyElement} AnyElement */
/** @typedef {import('./element').AnyElementName} AnyElementName */
/** @typedef {import('./element').AnyNode} AnyNode */
/** @typedef {import('./element').CreateElement} CreateElement */
/** @typedef {import('./element').Internals} Internals */
/** @typedef {import('./element').Paneled.Section} PaneledSection */
/** @typedef {import('./element').Content.Section} ContentSection */
