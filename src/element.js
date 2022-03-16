// @ts-check

import './polyfill.js'

// element
// -----------------------------------------------------------------------------

export class OUIPanelset extends HTMLElement {
	#internals = createInternals(this)

	connectedCallback() {
		this.#internals.connectedCallback()
	}

	get affordance() {
		return this.#internals.affordance
	}

	set affordance(value) {
		this.#internals.affordance = value
	}
}

// internals
// -----------------------------------------------------------------------------

const createInternals = (/** @type {HTMLElement} */ host) => {
	const shadowRoot = host.attachShadow({ mode: 'open', slotAssignment: 'manual' })

	shadowRoot.append(
		h.style(
			':where(button){all:unset;display:block;outline:revert}',
			':where([part~="labels"]){display:flex;gap:1em}',
			':where([part~="panel"]:not([part~="open"])){display:none}'
		)
	)

	const links = createLinks()

	const onclick = (/** @type {HTMLElementEventMap['click']} */ event) => {
		const item = links.get(event.currentTarget)

		const open = item.label.part.toggle('open')
		
		item.panel.part.toggle('open', open)

		const attributeName = item.label.part.contains('tab-bar') ? 'aria-selected' : 'aria-expanded'

		item.label.setAttribute(attributeName, String(open))
	}

	const onkeydown = (/** @type {HTMLElementEventMap['keydown']} */ event) => {
		const item = links.get(event.currentTarget)

		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowLeft':
				if (item.prev) {
					item.prev.label.focus()
				}
				break
			case 'ArrowDown':
			case 'ArrowRight':
				if (item.next) {
					item.next.label.focus()
				}
				break
		}
	}

	const internals = {
		affordance: 'collapse',
		templates: {},
		observer: new MutationObserver(
			(records) => {
				console.log(records)
			}
		),
		refresh() {
			if (!host.isConnected) return

			internals.content = getContent(...host.childNodes)

			const { affordance, templates, createTemplate } = internals

			if (!templates[affordance]) {
				templates[affordance] = createTemplate[affordance]()
			}

			console.log('refresh')
		},
		connectedCallback() {
			internals.observer.observe(host, { childList: true })

			internals.refresh()
		},
		createTemplate: {
			'collapse'() {
				// <div part="container collapse">
				const shadowContainer = h.div({ part: 'container collapse' })

				shadowRoot.append(shadowContainer)

				for (const [ index, actualLabel, ...actualPanels ] of internals.content) {
					// <slot name="label">
					const shadowLabelSlot = h.slot({ name: 'label' })

					// <button part="label collapse">
					const shadowLabel = h.button({ part: 'label collapse', id: 'label-' + index, ariaControls: 'panel-' + index, ariaExpanded: false, onclick, onkeydown }, shadowLabelSlot)

					// <slot name="panel">
					const shadowPanelSlot = h.slot({ name: 'panel' })

					// <div part="panel collapse">
					const shadowPanel = h.div({ part: 'panel collapse', id: 'panel-' + index, ariaLabelledby: 'label-' + index }, shadowPanelSlot)

					links.add(shadowLabel, shadowPanel)

					shadowContainer.append(shadowLabel)
					shadowContainer.append(shadowPanel)

					shadowLabelSlot.assign(actualLabel)
					shadowPanelSlot.assign(...actualPanels)
				}

				return shadowContainer
			},
			'tab-bar'() {
				// <div part="container tab-bar">
				const shadowContainer = h.div({ part: 'container tab-bar' })

				// <div part="labels tab-bar">
				const labelsContainer = h.div({ part: 'labels tab-bar', role: 'tablist' })

				// <div part="panels tab-bar">
				const panelsContainer = h.div({ part: 'panels tab-bar' })

				shadowContainer.append(labelsContainer, panelsContainer)

				shadowRoot.append(shadowContainer)

				for (const [ index, actualLabel, ...actualPanels ] of internals.content) {
					// <slot name="label">
					const shadowLabelSlot = h.slot({ name: 'label-' + index })

					// <button part="label tab-bar">
					const shadowLabel = h.button({ part: 'label tab-bar', role: 'tab', id: 'label-' + index, ariaControls: 'panel-' + index, ariaSelected: false, onclick, onkeydown }, shadowLabelSlot)

					// <slot name="panel">
					const shadowPanelSlot = h.slot({ name: 'panel-' + index })

					// <div part="panel tab-bar">
					const shadowPanel = h.div({ part: 'panel tab-bar', role: 'tabpanel', id: 'panel-' + index, ariaLabelledby: 'label-' + index }, shadowPanelSlot)

					links.add(shadowLabel, shadowPanel)

					labelsContainer.append(shadowLabel)
					panelsContainer.append(shadowPanel)

					shadowLabelSlot.assign(actualLabel)
					shadowPanelSlot.assign(...actualPanels)
				}

				return shadowContainer
			},
		},
	}

	return internals
}

const getContent = (/** @type {ChildNode[]} */ ...childNodes) => {
	/** @type {[ number, HTMLHeadingElement, ...(Element | Text)[] ][]} */
	const panelset = []

	/** @type {[ number, HTMLHeadingElement, ...Node[] ]} */
	let panel = /** @type {any} */ ([])

	let index = 0

	for (const childNode of childNodes) {
		if (childNode instanceof Element) {
			childNode.removeAttribute('slot')
		}

		if (childNode instanceof HTMLHeadingElement) {
			panelset.push(panel = [ ++index, childNode ])
		} else {
			panel.push(childNode)
		}
	}

	return panelset
}

// utilities
// -----------------------------------------------------------------------------

const toDashedCase = (/** @type {string} */ value) => value.replace(/[A-Z]/g, '-$&').toLowerCase()

const h = new Proxy(/** @type {import('./element').Internals.H} */ ({}), {
	get(_, /** @type {string} */ name) {
		const element = document.createElement(name)

		return (/** @type {any[]} */ ...args) => {
			const props = typeof args[0] === 'object' && Object(args[0]).constructor === Object ? args.shift() : null

			for (const prop in props) {
				if (prop in element) element[prop] = props[prop]
				else element.setAttribute(toDashedCase(prop), props[prop])
			}

			element.append(...args)

			return element
		}
	}
})

/** @type {() => import('./element').Internals.Links} */ 
const createLinks = () => ({
	all: [],
	ref: new WeakMap,
	add(label, panel) {
		const { all, ref } = this
		const prev = all[all.length - 1] || null

		/** @type {import('./element').Internals.Link} */
		const link = { label, panel, prev, next: null, all }

		if (prev) prev.next = link

		all.push(link)
		ref.set(label, link)
	},
	get(target) {
		return this.ref.get(target)
	}
})
