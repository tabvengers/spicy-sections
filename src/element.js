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
			// default styles for all affordances
			':where(div){display:contents}',
			':where(button){all:unset;display:block;outline:revert}',
			':where([part~="labels"]){display:flex;gap:1em}',
			':where([part~="panel"]:not([part~="open"])){display:none}',
			// default styles for collapse affordance
			':where([part~="label"][part~="collapse"]){align-items:center;display:flex;gap:.25em}',
			':where([part~="label"] > svg){height:.75em;width:.75em;transform:rotate(90deg)}',
			':where([part~="label"][part~="open"] > svg){transform:rotate(180deg)}',
			// default styles for tab-bar affordance
			':where([part~="label"][part~="tab-bar"][part~="open"]) ::slotted(*){text-decoration:underline}'
		)
	)

	const links = createLinks()

	const onclick = (/** @type {HTMLElementEventMap['click'] & { currentTarget: HTMLButtonElement }} */ event) => {
		const item = links.get(event.currentTarget)

		// const isTabBar = item.label.part.contains('tab-bar')

		links.toggleOne(event.currentTarget)

		// const open = item.label.part.toggle('open')
		
		// item.panel.part.toggle('open', open)

		// const attributeName = item.label.part.contains('tab-bar') ? 'aria-selected' : 'aria-expanded'

		// item.label.setAttribute(attributeName, String(open))
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
		affordance: 'tab-bar',
		activeIndex: 1,
		templates: {},
		observer: new MutationObserver(
			() => internals.refresh()
		),
		refresh() {
			if (!host.isConnected) return

			internals.content = getContent(...host.childNodes)

			const { affordance, createTemplate } = internals

			createTemplate[affordance]()
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

					// <svg>
					const shadowMarker = h.svg({ viewBox: '0 0 270 240' }, h.polygon({ points: '5,235 135,10 265,235' }))

					// <button part="label collapse">
					const shadowLabel = h.button({ part: 'label collapse', id: 'label-' + index, ariaControls: 'panel-' + index, ariaExpanded: false, onclick, onkeydown }, shadowMarker, shadowLabelSlot)

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
					const shadowLabel = h.button({ part: 'label tab-bar', role: 'tab', id: 'label-' + index, ariaControls: 'panel-' + index, ariaSelected: false, tabIndex: -1, onclick, onkeydown }, shadowLabelSlot)

					// <slot name="panel">
					const shadowPanelSlot = h.slot({ name: 'panel-' + index })

					// <div part="panel tab-bar">
					const shadowPanel = h.div({ part: 'panel tab-bar', role: 'tabpanel', id: 'panel-' + index, ariaLabelledby: 'label-' + index }, shadowPanelSlot)

					links.add(shadowLabel, shadowPanel)

					labelsContainer.append(shadowLabel)
					panelsContainer.append(shadowPanel)

					shadowLabelSlot.assign(actualLabel)
					shadowPanelSlot.assign(...actualPanels)

					if (index === internals.activeIndex) {
						shadowLabel.tabIndex = 0
						shadowLabel.part.add('open')
						shadowPanel.part.add('open')
					}
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
		const isSVG = name === 'svg' || name === 'polygon'
		const element = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', name) : document.createElement(name)

		return (/** @type {any[]} */ ...args) => {
			const props = typeof args[0] === 'object' && Object(args[0]).constructor === Object ? args.shift() : null

			for (const prop in props) {
				if (prop in element && (element[prop] === null || typeof element[prop] === 'string')) element[prop] = props[prop]
				else element.setAttribute(isSVG ? prop : toDashedCase(prop), props[prop])
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
	},
	toggleOne(target) {
		if (target.part.contains('open')) return

		const isTabBar = target.part.contains('tab-bar')
		const { all, ref } = this
		const link = ref.get(target)
		const attributeName = isTabBar ? 'aria-selected' : 'aria-expanded'

		for (const anyLink of all) {
			if (anyLink === link) {
				anyLink.label.tabIndex = 0
				anyLink.label.setAttribute(attributeName, 'true')
				anyLink.label.part.add('open')
				anyLink.panel.part.add('open')
			} else {
				anyLink.label.tabIndex = -1
				anyLink.label.setAttribute(attributeName, 'false')
				anyLink.label.part.remove('open')
				anyLink.panel.part.remove('open')
			}
		}
	},
})
