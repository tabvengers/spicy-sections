// panelset class
// -----------------------------------------------------------------------------

export class OUIPanelsetElement extends HTMLElement {
	#internals = createInternals(this)

	get affordance() {
		return this.#internals.affordance
	}

	set affordance(value) {
		this.#internals.affordance = value
	}

	getActivePanels() {
		return this.#internals.getActivePanels()
	}
}



// panelset internals creator
// -----------------------------------------------------------------------------

let createInternals = (host: OUIPanelsetElement) => {
	/** Current affordance, which is 'content', 'disclosure', or 'tablist'. */
	let affordance: Affordance = 'content'



	// LightDOM references
	// -------------------------------------------------------------------------

	/** Document associated with the current Panelset. */
	let document = host.ownerDocument

	/** Window associated with the current Panelset. */
	let window = document.defaultView

	/** Panelset LightDOM child nodes. */
	let hostChildNodes = host.childNodes

	/** Panelset LightDOM computed style. */
	let hostComputedStyle = getComputedStyle(host)



	// ShadowDOM references
	// -------------------------------------------------------------------------

	/** Panelset ShadowDOM root. */
	let shadowRoot = host.attachShadow({ mode: 'closed', slotAssignment: 'manual' })

	/** Panelset ShadowDOM container of all content. */
	let shadowContents = attrs(html('div'), { part: 'contents' })

	/** Panelset ShadowDOM container of all default styles (used in tabbed affordance"). */
	let shadowStyle = html('style')

	/** Panelset ShadowDOM container of all panel labels. */
	let shadowLabelset = attrs(html('div'), { part: 'labelset is-tablist' })

	/** Panelset ShadowDOM container of all panel contents. */
	let shadowContentset = attrs(html('div'), { part: 'contentset is-tablist' })



	// ShadowDOM styles
	// -------------------------------------------------------------------------

	// include the following default syles
	shadowStyle.append(
		// default styles for all affordances
		':where(div){outline:none}',
		':where(button){all:unset;outline:revert}',
		':where(svg){display:none}',
		':where([part~="content"]:not([part~="open"])){display:none}',

		// default styles for the disclosure affordance
		':where([part~="is-disclosure"][part~="section"]){display:flex;flex-direction:column}',
		':where([part~="is-disclosure"][part~="label"]){align-items:center;display:flex;gap:.25em;padding-inline-end:1em}',
		':where([part~="is-disclosure"][part~="marker"]){display:block;height:.75em;width:.75em;transform:rotate(90deg)}',
		':where([part~="is-disclosure"][part~="marker"][part~="open"]){transform:rotate(180deg)}',

		// default styles for the tablist affordance
		':where([part~="is-tablist"][part~="labelset"]){display:flex;gap:1em}',
		':where([part~="is-tablist"][part~="label"][part~="open"]) ::slotted(*){text-decoration:underline}'
	)



	// ShadowDOM tree
	// -------------------------------------------------------------------------

	// append content and style containers to the ShadowDOM root
	shadowRoot.append(shadowContents, shadowStyle)



	// -------------------------------------------------------------------------

	let refs = {
		lastSection: null as Panel | null,
		panels: [] as Panel[],
		panelBySlottedLabel: new WeakMap<SlottedPanel.Label, Panel>(),
		panelByShadowLabel: new WeakMap<ShadowPanel.Label, Panel>(),
	}



	// events
	// -------------------------------------------------------------------------

	let onclick = (event: MouseEvent) => {
		panelToggledCallback(refs.panelByShadowLabel.get(event.currentTarget as ShadowPanel.Label) as Panel)
	}

	let onkeydown = (event: KeyboardEvent) => {
		let move: '' | 'prev' | 'next' = ''

		switch (event.code) {
			case 'ArrowUp':
			case 'ArrowLeft':
				move = 'prev'
				break
			case 'ArrowDown':
			case 'ArrowRight':
				move = 'next'
				break
		}

		if (move) {
			event.preventDefault()
			event.stopImmediatePropagation()

			panelNavigatedCallback(
				refs.panelByShadowLabel.get(event.currentTarget as ShadowPanel.Label) as Panel,
				move
			)
		}
	}



	// callbacks
	// -------------------------------------------------------------------------

	/** Run whenever nodes are added to or removed from the panelset host. */
	let childrenChangedCallback = () => {
		/** Any panel extracted from the panelset element. */
		let panel = { slotted: { content: [] } } as unknown as Panel
		let previous = null as unknown as Panel

		let index = 0

		refs.panels.splice(0)

		for (let node of hostChildNodes) {
			if (node instanceof HTMLHeadingElement) {
				panel = upsert(refs.panelBySlottedLabel, node, {
					insert(label) {
						// add a new panel, if the child node is a heading
						panel = {
							index,
							open: false,
							slotted: {
								label,
								content: [],
							},
							shadow: {
								/** Section (`<div part="section">`). */
								section: attrs(html('div'), { part: 'section' }),

								/** Label (`<button part="label">`). */
								label: attrs(html('button'), { part: 'label', type: 'button' }),
								labelSlot: html('slot'),

								/** Label (`<button part="label">`). */
								nonLabel: attrs(html('div'), { part: 'label is-content open' }),
								nonLabelSlot: html('slot'),

								/** Marker (`<svg part="marker">`). */
								marker: attrs(svg('svg'), { part: 'marker', viewBox: '0 0 270 240', namespaceURI: 'http://www.w3.org/2000/svg' }),

								/** Content (`<div part="content">`). */
								content: attrs(html('div'), { part: 'content', role: 'region', tabindex: 0 }),
								contentSlot: html('slot'),
							},
							prev: null,
							next: null,
						}

						props(panel.shadow.label, { onclick, onkeydown })

						panel.shadow.marker.append(attrs(svg('polygon'), { points: '5,235 135,10 265,235', namespaceURI: 'http://www.w3.org/2000/svg' }))
						panel.shadow.label.append(panel.shadow.marker, panel.shadow.labelSlot)
						panel.shadow.nonLabel.append(panel.shadow.nonLabelSlot)
						panel.shadow.content.append(panel.shadow.contentSlot)

						refs.panelBySlottedLabel.set(label, panel)
						refs.panelByShadowLabel.set(panel.shadow.label, panel)

						return panel
					},
					update(panel) {
						attrs(panel.shadow.label, { id: 'label-' + index, 'aria-controls': 'content-' + index })
						attrs(panel.shadow.labelSlot, { name: 'label-' + index })
						attrs(panel.shadow.nonLabel, { id: 'label-' + index })
						attrs(panel.shadow.nonLabelSlot, { name: 'label-' + index })

						attrs(panel.shadow.content, { id: 'content-' + index, 'aria-labelledby': 'label-' + index })
						attrs(panel.shadow.contentSlot, { name: 'content-' + index })

						return panel
					},
				})

				index = refs.panels.push(panel)

				if (previous) {
					panel.prev = previous
					previous.next = panel
				}

				previous = panel

				if (refs.lastSection === null) {
					refs.lastSection = panel
					panel.open = true
				}
			} else if (node instanceof Element || node instanceof Text) {
				// otherwise, append the child node to the existing panel
				panel.slotted.content.push(node)
			}
		}

		affordanceChangedCallback()
	}

	/** Run whenever the panelset affordance is changed. */
	let affordanceChangedCallback = () => {
		attrs(shadowContents, { part: withAffordance('contents') })

		if (affordance === 'tablist') {
			shadowContents.replaceChildren(shadowLabelset, shadowContentset)
		} else {
			shadowContents.replaceChildren()
		}

		for (let panel of refs.panels) {
			attrs(panel.shadow.section, { part: withAffordance('section') })
			attrs(panel.shadow.label, { part: withAffordance('label') })
			attrs(panel.shadow.marker, { part: withAffordance('marker') })
			attrs(panel.shadow.content, { part: withAffordance('content') })

			switch (affordance) {
				case 'content': {
					panel.shadow.content.removeAttribute('tabindex')
					panel.shadow.content.part.toggle('open', true)

					panel.shadow.section.replaceChildren(panel.shadow.nonLabel, panel.shadow.content)

					shadowContents.append(panel.shadow.section)

					assignSlot(panel.shadow.nonLabelSlot, panel.slotted.label)
					assignSlot(panel.shadow.contentSlot, ...panel.slotted.content)

					break
				}

				case 'disclosure': {
					panel.shadow.content.tabIndex = 0

					panel.shadow.content.part.toggle('open', panel.open)
					panel.shadow.label.part.toggle('open', panel.open)
					panel.shadow.marker.part.toggle('open', panel.open)

					panel.shadow.section.replaceChildren(panel.shadow.label, panel.shadow.content)
					shadowContents.append(panel.shadow.section)

					assignSlot(panel.shadow.labelSlot, panel.slotted.label)
					assignSlot(panel.shadow.contentSlot, ...panel.slotted.content)

					break
				}

				case 'tablist': {
					panel.open = refs.lastSection === panel

					panel.shadow.label.tabIndex = panel.open ? 0 : -1
					panel.shadow.content.tabIndex = 0

					panel.shadow.label.part.toggle('open', panel.open)
					panel.shadow.content.part.toggle('open', panel.open)

					shadowLabelset.append(panel.shadow.label)
					shadowContentset.append(panel.shadow.content)

					assignSlot(panel.shadow.labelSlot, panel.slotted.label)
					assignSlot(panel.shadow.contentSlot, ...panel.slotted.content)

					break
				}
			}
		}
	}

	/** Run whenever the given panelset panel is toggled. */
	let panelToggledCallback = (selectedSection: Panel) => {
		let { open } = selectedSection

		if (!open) {
			refs.lastSection = selectedSection
		}

		switch (affordance) {
			case 'disclosure': {
				open = selectedSection.open = !open

				selectedSection.shadow.section.part.toggle('open', open)
				selectedSection.shadow.label.part.toggle('open', open)
				selectedSection.shadow.marker.part.toggle('open', open)
				selectedSection.shadow.content.part.toggle('open', open)

				break
			}

			case 'tablist': {
				if (selectedSection.open) {
					return
				}

				for (let panel of refs.panels) {
					let open = panel.open = panel === selectedSection

					panel.shadow.label.tabIndex = open ? 0 : -1

					panel.shadow.section.part.toggle('open', open)
					panel.shadow.label.part.toggle('open', open)
					panel.shadow.marker.part.toggle('open', open)
					panel.shadow.content.part.toggle('open', open)
				}

				break
			}
		}

		host.dispatchEvent(
			new CustomEvent('open', {
				detail: {
					label: selectedSection.slotted.label,
					content: selectedSection.slotted.content.slice(0),
				}
			})
		)
	}

	/** Run whenever a panel is being navigated from. */
	let panelNavigatedCallback = (focusedSection: Panel, move: 'prev' | 'next') => {
		let siblingSection = focusedSection[move]

		if (siblingSection) {
			siblingSection.shadow.label.focus()

			if (affordance === 'tablist') {
				panelToggledCallback(siblingSection)
			}
		}
	}



	// utilities
	// -------------------------------------------------------------------------

	/** Returns the given part identifier and the current affordance. */
	let withAffordance = (identifier: string) => identifier + ' is-' + affordance



	// handle changes to any DOM child nodes
	// -------------------------------------------------------------------------

	new MutationObserver(childrenChangedCallback)

	if (host.hasChildNodes()) childrenChangedCallback()



	// handle changes to the CSS --affordance property
	// -------------------------------------------------------------------------

	let oldValue = affordance as string
	let newValue = ''

	let frameA = () => {
		requestAnimationFrame(frameB)
		newValue = hostComputedStyle.getPropertyValue('--affordance')
	}

	let frameB = () => {
		requestAnimationFrame(frameA)
		if (oldValue !== newValue) {
			oldValue = newValue

			internals.affordance = newValue.trim() || 'content'
		}
	}

	frameA()



	// internals
	// -------------------------------------------------------------------------

	let internals = {
		get affordance() {
			return affordance
		},
		set affordance(value: string) {
			value = value.toLowerCase()

			if (value === 'disclosure' || value === 'tablist' || value === 'content') {
				if (value !== affordance) {
					affordance = value

					affordanceChangedCallback()
				}
			}
		},
		getActivePanels() {
			let activePanels = []
			for (let panel of refs.panels) {
				if (panel.open) {
					activePanels.push({
						label: panel.slotted.label,
						content: panel.slotted.content.slice(0),
					})
				}
			}
			return activePanels
		},
	}

	return internals
}



// utilities
// -----------------------------------------------------------------------------

/** Assigns to the given slot the given nodes (using manual slot assignment when supported). */
let assignSlot = (slot: HTMLSlotElement, ...nodes: (Element | Text)[]) => {
	if (supportsSlotAssignment) {
		slot.assign(...nodes)
	} else {
		for (let node of nodes) {
			if (node instanceof Element) {
				attrs(node, { slot: slot.name })
			}
		}
	}
}

/** Whether slot assignment is supported by the current browser. */
let supportsSlotAssignment = typeof HTMLSlotElement === 'function' && typeof HTMLSlotElement.prototype.assign === 'function'

/** Returns a new HTML element specified by the given tag name. */
let html = <T extends keyof HTMLElementTagNameMap>(name: T) => document.createElement(name) as HTMLElementTagNameMap[T]

/** Returns a new SVG element specified by the given tag name. */
let svg = <T extends keyof SVGElementTagNameMap>(name: T) => document.createElementNS('http://www.w3.org/2000/svg', name) as SVGElementTagNameMap[T]

/** Appends multiple . */
let attrs = <E extends Element, V extends Primitive, P extends { [K in keyof P]: V }>(element: E, props: P) => {
	for (let prop in props) element.setAttribute(prop, String(props[prop]))
	return element as E & P
}

let props = Object.assign as <O extends object>(o: O, ...p: { [K in keyof O]?: O[K] }[]) => O

let upsert = <K extends object, V>(map: WeakMap<K, V>, key: K, fns: { insert(key: K): V, update(old: V): V }) => {
	let value: V

	map.set(key, value = map.has(key) ? fns.update(map.get(key) as V) : fns.update(fns.insert(key)))

	return value
}

type Affordance = 'content' | 'disclosure' | 'tablist'

declare namespace SlottedPanel {
	type Label = HTMLHeadingElement
	type Content = (Element | Text)[]
}

declare namespace ShadowPanel {
	type Label = HTMLButtonElement
	type Content = HTMLDivElement
	type Section = HTMLDivElement
}

declare interface Panel {
	index: number
	open: boolean

	slotted: {
		label: HTMLHeadingElement
		content: (Element | Text)[]
	}

	shadow: {
		section: HTMLDivElement
		label: HTMLButtonElement
		labelSlot: HTMLSlotElement
		marker: SVGSVGElement
		nonLabel: HTMLDivElement
		nonLabelSlot: HTMLSlotElement
		content: HTMLDivElement
		contentSlot: HTMLSlotElement
	}

	prev: Panel | null
	next: Panel | null
}

type Primitive = string | number | bigint | boolean | symbol | null | undefined
