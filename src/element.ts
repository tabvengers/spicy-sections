import type { Internal, Primitive, Slotted } from './internal'

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
		return this.#internals.getActivePanels() as unknown as {
			label: HTMLHeadingElement
			content: (Element | Text)[]
		}
	}
}



// panelset internals creator
// -----------------------------------------------------------------------------

let createInternals = (host: OUIPanelsetElement) => {
	/** Current affordance. */
	let affordance: Internal.Affordance = 'content'



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

	/** Panelset ShadowDOM container of all default styles. */
	let shadowStyle = html('style')

	/** Panelset ShadowDOM container of all section labels. */
	let shadowLabelset = attrs(html('div'), { part: 'labelset is-tablist' })

	/** Panelset ShadowDOM container of all section contents. */
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
		lastSection: null as Internal.Section | null,
		sections: [] as Internal.Section[],
		sectionBySlottedLabel: new WeakMap<Internal.Slotted.Label, Internal.Section>(),
		sectionByShadowLabel: new WeakMap<Internal.Shadow.Label, Internal.Section>(),
	}



	// events
	// -------------------------------------------------------------------------

	let onclick = (event: MouseEvent) => {
		sectionToggledCallback(refs.sectionByShadowLabel.get(event.currentTarget as Internal.Shadow.Label) as Internal.Section)
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

			sectionNavigatedCallback(
				refs.sectionByShadowLabel.get(
					event.currentTarget as Internal.Shadow.Label
				) as Internal.Section,
				move
			)
		}
	}



	// callbacks
	// -------------------------------------------------------------------------

	/** Run whenever nodes are added to or removed from the panelset host. */
	let childrenChangedCallback = () => {
		/** Any section extracted from the panelset element. */
		let section = { slotted: { content: [] } } as unknown as Internal.Section
		let previous = null as unknown as Internal.Section

		let index = 0

		refs.sections.splice(0)

		for (let node of hostChildNodes) {
			if (node instanceof HTMLHeadingElement) {
				section = upsert(refs.sectionBySlottedLabel, node, {
					insert(label) {
						// add a new section, if the child node is a heading
						section = {
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

						props(section.shadow.label, { onclick, onkeydown })

						section.shadow.marker.append(attrs(svg('polygon'), { points: '5,235 135,10 265,235', namespaceURI: 'http://www.w3.org/2000/svg' }))
						section.shadow.label.append(section.shadow.marker, section.shadow.labelSlot)
						section.shadow.nonLabel.append(section.shadow.nonLabelSlot)
						section.shadow.content.append(section.shadow.contentSlot)

						refs.sectionBySlottedLabel.set(label, section)
						refs.sectionByShadowLabel.set(section.shadow.label, section)

						return section
					},
					update(section) {
						attrs(section.shadow.label, { id: 'label-' + index, 'aria-controls': 'content-' + index })
						attrs(section.shadow.labelSlot, { name: 'label-' + index })
						attrs(section.shadow.nonLabel, { id: 'label-' + index })
						attrs(section.shadow.nonLabelSlot, { name: 'label-' + index })

						attrs(section.shadow.content, { id: 'content-' + index, 'aria-labelledby': 'label-' + index })
						attrs(section.shadow.contentSlot, { name: 'content-' + index })

						return section
					},
				})

				index = refs.sections.push(section)

				if (previous) {
					section.prev = previous
					previous.next = section
				}

				previous = section

				if (refs.lastSection === null) {
					refs.lastSection = section
					section.open = true
				}
			} else if (node instanceof Element || node instanceof Text) {
				// otherwise, append the child node to the existing section
				section.slotted.content.push(node)
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

		for (let section of refs.sections) {
			attrs(section.shadow.section, { part: withAffordance('section') })
			attrs(section.shadow.label, { part: withAffordance('label') })
			attrs(section.shadow.marker, { part: withAffordance('marker') })
			attrs(section.shadow.content, { part: withAffordance('content') })

			switch (affordance) {
				case 'content': {
					section.shadow.content.removeAttribute('tabindex')
					section.shadow.content.part.toggle('open', true)

					section.shadow.section.replaceChildren(section.shadow.nonLabel, section.shadow.content)

					shadowContents.append(section.shadow.section)

					assignSlot(section.shadow.nonLabelSlot, section.slotted.label)
					assignSlot(section.shadow.contentSlot, ...section.slotted.content)

					break
				}

				case 'disclosure': {
					section.shadow.content.tabIndex = 0

					section.shadow.content.part.toggle('open', section.open)
					section.shadow.label.part.toggle('open', section.open)
					section.shadow.marker.part.toggle('open', section.open)

					section.shadow.section.replaceChildren(section.shadow.label, section.shadow.content)
					shadowContents.append(section.shadow.section)

					assignSlot(section.shadow.labelSlot, section.slotted.label)
					assignSlot(section.shadow.contentSlot, ...section.slotted.content)

					break
				}

				case 'tablist': {
					section.open = refs.lastSection === section

					section.shadow.label.tabIndex = section.open ? 0 : -1
					section.shadow.content.tabIndex = 0

					section.shadow.label.part.toggle('open', section.open)
					section.shadow.content.part.toggle('open', section.open)

					shadowLabelset.append(section.shadow.label)
					shadowContentset.append(section.shadow.content)

					assignSlot(section.shadow.labelSlot, section.slotted.label)
					assignSlot(section.shadow.contentSlot, ...section.slotted.content)

					break
				}
			}
		}
	}

	/** Run whenever the given panelset section is toggled. */
	let sectionToggledCallback = (selectedSection: Internal.Section) => {
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

				for (let section of refs.sections) {
					let open = section.open = section === selectedSection

					section.shadow.label.tabIndex = open ? 0 : -1

					section.shadow.section.part.toggle('open', open)
					section.shadow.label.part.toggle('open', open)
					section.shadow.marker.part.toggle('open', open)
					section.shadow.content.part.toggle('open', open)
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

	/** Run whenever a section is being navigated from. */
	let sectionNavigatedCallback = (focusedSection: Internal.Section, move: 'prev' | 'next') => {
		let siblingSection = focusedSection[move]

		if (siblingSection) {
			siblingSection.shadow.label.focus()

			if (affordance === 'tablist') {
				sectionToggledCallback(siblingSection)
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
			for (let section of refs.sections) {
				if (section.open) {
					activePanels.push({
						label: section.slotted.label,
						content: section.slotted.content.slice(0),
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
let assignSlot = (slot: HTMLSlotElement, ...nodes: Slotted[]) => {
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
