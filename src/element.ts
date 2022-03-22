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
	let shadowContents = createElement('div', { part: 'contents' })

	/** Panelset ShadowDOM container of all default styles (used in tabbed affordance"). */
	let shadowStyle = createElement('style')

	/** Panelset ShadowDOM container of all panel labels. */
	let shadowLabelset = createElement('div', { part: 'labelset is-tablist' })

	/** Panelset ShadowDOM container of all panel contents. */
	let shadowContentset = createElement('div', { part: 'contentset is-tablist' })



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
								section: createElement('div', { part: 'section' }),

								/** Label (`<button part="label">`). */
								label: createElement('button', { part: 'label', type: 'button' }),
								labelSlot: createElement('slot'),

								/** Label (`<button part="label">`). */
								nonLabel: createElement('div', { part: 'label is-content open' }),
								nonLabelSlot: createElement('slot'),

								/** Marker (`<svg part="marker">`). */
								marker: createElement('svg', { part: 'marker', viewBox: '0 0 270 240', xmlns: 'http://www.w3.org/2000/svg' }),

								/** Content (`<div part="content">`). */
								content: createElement('div', { part: 'content', role: 'region', tabindex: 0 }),
								contentSlot: createElement('slot'),
							},
							prev: null,
							next: null,
						}

						setProps(panel.shadow.label, { onclick, onkeydown })

						panel.shadow.marker.append(createElement('polygon', { points: '5,235 135,10 265,235', xmlns: 'http://www.w3.org/2000/svg' }))
						panel.shadow.label.append(panel.shadow.marker, panel.shadow.labelSlot)
						panel.shadow.nonLabel.append(panel.shadow.nonLabelSlot)
						panel.shadow.content.append(panel.shadow.contentSlot)

						refs.panelBySlottedLabel.set(label, panel)
						refs.panelByShadowLabel.set(panel.shadow.label, panel)

						return panel
					},
					update(panel) {
						setAttributes(panel.shadow.label, { id: 'label-' + index, 'aria-controls': 'content-' + index })
						setAttributes(panel.shadow.labelSlot, { name: 'label-' + index })
						setAttributes(panel.shadow.nonLabel, { id: 'label-' + index })
						setAttributes(panel.shadow.nonLabelSlot, { name: 'label-' + index })

						setAttributes(panel.shadow.content, { id: 'content-' + index, 'aria-labelledby': 'label-' + index })
						setAttributes(panel.shadow.contentSlot, { name: 'content-' + index })

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
		setAttributes(shadowContents, { part: withAffordance('contents') })

		if (affordance === 'tablist') {
			shadowContents.replaceChildren(shadowLabelset, shadowContentset)
		} else {
			shadowContents.replaceChildren()
		}

		for (let panel of refs.panels) {
			setAttributes(panel.shadow.section, { part: withAffordance('section') })
			setAttributes(panel.shadow.label, { part: withAffordance('label') })
			setAttributes(panel.shadow.marker, { part: withAffordance('marker') })
			setAttributes(panel.shadow.content, { part: withAffordance('content') })

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
				setAttributes(node, { slot: slot.name })
			}
		}
	}
}

/** Whether slot assignment is supported by the current browser. */
let supportsSlotAssignment = typeof HTMLSlotElement === 'function' && typeof HTMLSlotElement.prototype.assign === 'function'

/** Returns a new element specified by the given tag name with the given attributes. */
let createElement = <K extends string, N extends HTMLAttributes>(name: K, attrs: N = null as unknown as N) => {
	let xmlns = attrs && attrs.xmlns || 'http://www.w3.org/1999/xhtml'
	let element = document.createElementNS(attrs && delete attrs.xmlns && xmlns || 'http://www.w3.org/1999/xhtml', name) as N['xmlns'] extends 'http://www.w3.org/2000/svg' ? K extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[K] : SVGElement : K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement

	return setAttributes(element, attrs)
}

/** Returns the given element with the given attributes set. */
let setAttributes = <E extends Element>(element: E, props: HTMLAttributes) => {
	for (let prop in props) {
		element.setAttribute(prop, props[prop] as string)
	}

	return element
}

/** Returns the given object with the given properties set. */
let setProps = Object.assign as <O extends object>(o: O, ...p: { [K in keyof O]?: O[K] }[]) => O

/** Returns the value of the given weakmap with the given key, using the given options to add or update that value. */
let upsert = <K extends object, V>(map: WeakMap<K, V>, key: K, fns: { insert(key: K): V, update(old: V): V }) => {
	let value: V

	map.set(
		key,
		value = map.has(key)
			? fns.update(map.get(key) as V)
		: fns.update(fns.insert(key))
	)

	return value
}



// Typing
// -----------------------------------------------------------------------------

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

type HTMLAttributes = Record<string, Primitive> & {
	xmlns?: 'http://www.w3.org/1999/xhtml' | 'http://www.w3.org/2000/svg'
}
