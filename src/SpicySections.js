/**
 * This work is licensed under the W3C Software and Document License
 * (http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
 */
class MediaAffordancesElement extends HTMLElement {
	constructor() {
		super()

		this.mqls = []
		this.observers = []
		this.supportedAffordances = new Set()
	}

	observeAffordanceChange(cb) {
		this.observers.push(cb)
	}

	notifyChange() {
		let intersection = new Set()

		for (let elem of this.mqls) {
			if (elem.matches && this.supportedAffordances.has(elem.__affordance)) {
				intersection.add(elem.__affordance)
			}
		}

		let arr = [...intersection]

		if (arr.length > 0) {
			this.setAttribute('mq-matched', arr.join(' '))
		} else {
			this.removeAttribute('mq-matched')
		}

		let affordance = arr[0]

		if (affordance) {
			this.setAttribute('affordance', affordance)
		} else {
			this.removeAttribute('affordance')
		}

		this.observers.forEach((cb) => {
			cb(intersection, this.__matching)
		})
	}

	static get observedAttributes() {
		return ['mq-affordances']
	}

	connectedCallback() {
		let newValue = getComputedStyle(this).getPropertyValue('--const-mq-affordances')

		this.connectListeners(newValue)
	}

	connectListeners(newValue = '') {
		if (newValue.trim().length === 0) {
			return
		}

		newValue.split('|').forEach((segment) => {
			let mq = segment.trim().match(/\[([^\]]*)/)[1]
			let names = segment.replace(`[${mq}]`, '').trim().split(' ')
			let mql = window.matchMedia(mq)

			mql.__affordance = names[0] // one for now
			mql.onchange = () => this.notifyChange()

			this.mqls.push(mql)
		}, this)

		this.notifyChange()
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.connectListeners(newValue)
	}
}

// ----------------------------------------------------

(() => {
	let lastUId = 0

	let nextUId = () => {
		return `cp${++lastUId}`
	}

	let getLabels = (regionset) => {
		return [...regionset.children].filter((el) => /^H\d$/.test(el.tagName) || el.tagName === 'SPICY-H')
	}

	let getContentEls = (regionset) => {
		return [...regionset.children].filter((el) => !/^H\d$/.test(el.tagName))
	}

	let ensureId = (el) => {
		el.id = el.id || nextUId()
		return el.id
	}

	let style = document.createElement('style')
	style.innerHTML = `
	:where(spicy-sections > [affordance*="collapse"])::before { 
		content: ' ';
		display: inline-block;
		width: 0.5em;
		height: 0.75em;
		margin: 0 0.4em 0 0;
		transform: rotate(90deg);
		background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='10px' height='10px' viewBox='0 0 270 240' enable-background='new 0 0 270 240' xml:space='preserve'%3e%3cpolygon fill='black' points='5,235 135,10 265,235 '/%3e%3c/svg%3e ");
		background-size: 100% 100%;
	} 

	:where(spicy-sections > .hide) {
		display: none !important;
	} 

	:where(spicy-sections > [affordance*="collapse"][aria-expanded="true"])::before, 
	:where(spicy-sections > [affordance*="collapse"][aria-expanded="true"])::after {
		transform: rotate(180deg);
	}
	`

	document.head.prepend(style)

	const template = `
	<style>
		:root {
			font-size: 1rem;
		}

		:host([hidden]),
		::slotted([hidden]) {
			display: none;
		}
		
		::slotted(spicy-h) {
			display: block;
		}

		::slotted(h1),
		::slotted(h2),
		::slotted(h3),
		::slotted(h4),
		::slotted(h5),
		::slotted(h6),
		::slotted(spicy-h){
			margin-right: 1rem;
		}

		[part="tab-bar"] ::slotted([tabindex="0"]) {
			border-bottom: 1px solid blue;
		}

		.hide {
			display: none;
		}
		
		[part="tab-list"] { 
			display: flex; 
			overflow: hidden;
			white-space: nowrap;
		}
	</style>
	<div part="tab-bar">
		<!-- The region/tablist should have a label -->
		<div part="tab-list" role="tablist"><slot name="tabListSlot"></slot></div>
	</div>
	<content part="content-panels">
		<slot default></slot>
	</content>
	`

	class RegionSet extends MediaAffordancesElement {
		__defaults
		__tabListEl

		// tabs and exclusive collapses should have the same affordance object?
		__affordanceConf = {
			collapse: {
				// can take a condition to force, check-like
				toggle: (label, condition) => {
					let state = typeof condition === 'boolean' ? condition : !label.affordanceState.expanded

					let contentEl = label.nextElementSibling

					label.affordanceState.expanded = state
					label.affordanceState.nonExclusiveExpanded = state

					label.setAttribute('aria-expanded', state)

					if (state) {
						label.setAttribute('expanded', '')

						contentEl.classList.remove('hide')
					} else {
						label.removeAttribute('expanded')

						contentEl.classList.add('hide')
					}
				},
			},
			'exclusive-collapse': {
				// ignores condition, radio-like
				toggle: (label) => {
					let labels = getLabels(label.parentElement)
					let siblings = labels.filter((c) => c !== label)
					let index = labels.findIndex((c) => c === label)

					siblings.forEach((sibLabel, i) => {
						let relatedContent = sibLabel.nextElementSibling

						relatedContent.classList.add('hide')

						sibLabel.tabIndex = -1
						sibLabel.setAttribute('aria-expanded', 'false')
						sibLabel.affordanceState.exclusiveExpanded = false
					})

					label.tabIndex = 0
					label.parentElement.affordanceState.exclusiveSelection.index = index // TODO: nope, fix/remove this?
					label.nextElementSibling.classList.remove('hide')
					label.setAttribute('aria-expanded', 'true')
					label.affordanceState.exclusiveExpanded = true
					label.focus()
				},
			},
			'tab-bar': {
				// ignores condition, radio-like
				toggle: (label) => {
					let labels = getLabels(label.parentElement)
					let siblings = labels.filter((c) => c !== label)
					let index = labels.findIndex((c) => c === label)

					siblings.forEach((sibLabel, i) => {
						let relatedContent = sibLabel.nextElementSibling

						relatedContent.classList.add('hide')

						sibLabel.tabIndex = -1
						sibLabel.setAttribute('aria-selected', 'false')
						sibLabel.affordanceState.exclusiveExpanded = false
					})

					label.tabIndex = 0
					label.parentElement.affordanceState.exclusiveSelection.index = index
					label.nextElementSibling.classList.remove('hide')
					label.setAttribute('aria-selected', 'true')
					label.affordanceState.exclusiveExpanded = true
					label.focus()
				},
			},
		}

		__setSize = (labelEls, contentEls) => {
			this.__size = Math.min(labelEls.length, contentEls.length)

			if (labelEls.length !== this.__size) {
				console.warn('mismatch in tab-set label/content pairs...')
			}

			labelEls.forEach((labelEl, i) => {
				let contentEl = contentEls[i]

				if (!labelEl.initialized) {
					labelEl.initialized = true // TODO: this used to be shadow, do i need it?

					let defs = this.__defaults.defaultActive

					// this assumes it is about collapses
					labelEl.affordanceState = {
						expanded: defs.includes(labelEl),
						active: false,
						// activate in the current mode
						activate: () => {
							if (this.affordanceState.current) {
								this.__affordanceConf[this.affordanceState.current].toggle(labelEl)
							}
						},
					}

					let defaultExclusive = defs.length === 0 ? labelEls[0] : defs[defs.length - 1]

					this.affordanceState.exclusiveSelection.index = labelEls.indexOf(defaultExclusive)
				}
				labelEl.setMode = (mode) => {
					if (mode === 'non-exclusive') {
						let isExpanded = labelEl.affordanceState.expanded

						labelEl.setAttribute('affordance', 'collapse')
						labelEl.setAttribute('tabindex', '0')
						labelEl.setAttribute('aria-controls', contentEl.id)
						labelEl.setAttribute('role', 'button')
						labelEl.setAttribute('aria-expanded', isExpanded)

						labelEl.nextElementSibling.classList.toggle('hide', !isExpanded)
					} else if (mode === 'exclusive') {
						let isExpanded = labelEls.indexOf(labelEl) === this.affordanceState.exclusiveSelection.index

						labelEl.setAttribute('affordance', 'collapse')
						labelEl.setAttribute('tabindex', isExpanded ? 0 : -1)
						labelEl.setAttribute('role', 'button')
						labelEl.setAttribute('aria-expanded', isExpanded)
						labelEl.setAttribute('aria-controls', contentEl.id)

						labelEl.nextElementSibling.classList.toggle('hide', !isExpanded)
					} else {
						labelEl.removeAttribute('tabIndex')
						labelEl.removeAttribute('affordance')
						labelEl.removeAttribute('aria-expanded')
						labelEl.removeAttribute('role')
					}
				}
			})
		}

		__projectTabBar = () => {
			this.__removeProjections()

			getLabels(this).forEach((tabSource, i) => {
				let selected = false
				let tabIndex = -1

				tabSource.setMode()
				tabSource.slot = 'tabListSlot'
				tabSource.setAttribute('role', 'tab')

				let contentSource = tabSource.nextElementSibling

				contentSource.tabIndex = 0

				tabSource.setAttribute('aria-controls', ensureId(contentSource))

				contentSource.setAttribute('role', 'tabpanel')
				contentSource.setAttribute('aria-labelledby', tabSource.id)

				if (i === this.affordanceState.exclusiveSelection.index) {
					tabIndex = 0
					selected = true
				}

				tabSource.setAttribute('aria-selected', selected)
				tabSource.tabIndex = tabIndex

				contentSource.classList.toggle('hide', !selected)

				// TODO: aria-orientation :(
			})
		}

		__projectCollapses = (exclusive) => {
			// TODO: remove projections and... ??
			this.__removeProjections()

			getLabels(this).forEach((label) => {
				label.setMode(exclusive ? 'exclusive' : 'non-exclusive')
			})
		}

		__removeProjections = () => {
			Array.from(this.children, (child) => {
				child.removeAttribute('slot')
				child.removeAttribute('affordance')
				child.removeAttribute('role')
				child.removeAttribute('aria-selected')
				child.removeAttribute('aria-controls')
				child.removeAttribute('tabindex')
				child.removeAttribute('aria-expanded')

				child.classList.remove('hide')
			})
		}

		// matching pairs
		__size = 0

		__configure = () => {
			// hmmm

			this.__setSize(getLabels(this), getContentEls(this))

			if (this.affordanceState.current === 'tab-bar') {
				this.affordanceState.currentMode = 'exclusive'
				this.__projectTabBar()
			} else if (this.affordanceState.current === 'collapse') {
				this.affordanceState.currentMode = 'non-exclusive'
				this.__projectCollapses()
			} else if (this.affordanceState.current === 'exclusive-collapse') {
				this.affordanceState.currentMode = 'exclusive'
				this.__projectCollapses(true)
			} else {
				this.affordanceState.currentMode = undefined
				this.__removeProjections()
			}

			// TODO: hmm, these are DOM changes, we could cache them
			let labelEls = getLabels(this)

			for (let i = 0; i < this.__size; i++) {
				let label = labelEls[i]

				// probably add one handler that decides
				if (!label._inited) {
					label.addEventListener('click', (evt) => {
						evt.target.affordanceState.activate()
					})

					label._inited = true
				}
			}
		}

		__childListObserver = new MutationObserver((mutationList) => {
			// we have to wire up new elements
			let labelEls = getLabels(this)
			let contentEls = getContentEls(this)

			// what if there is a mismatch?
			this.__setSize(labelEls, contentEls)
			this.__configure()
		})

		__tabset

		affordanceState = {
			exclusiveSelection: { index: undefined },
			current: undefined,
			currentMode: undefined,
			getLabels: () => {
				return getLabels(this)
			},
		}

		honourFragmentLink = () => {
			let labels = getLabels(this)

			if (location.hash && this.querySelector(location.hash)) {
				// try to find a label with this ID, or controlled content
				// that contains an element with this ID
				for (let i = 0; i < labels.length; i++) {
					let relevantContent = labels[i].getAttribute('aria-controls') && this.querySelector(`#${labels[i].getAttribute('aria-controls')}`)

					if (labels[i] === this.querySelector(location.hash) || (relevantContent && relevantContent.querySelector(location.hash))) {
						labels[i].affordanceState.activate()

						return
					}
				}
			}
		}

		// wires up supported affordances
		constructor() {
			super()

			this.supportedAffordances.add('tab-bar')
			this.supportedAffordances.add('collapse')
			this.supportedAffordances.add('exclusive-collapse')

			let checkDefaults = () => {
				if (!this.__defaults) {
					this.__defaults = {
						onMatch: this.hasAttribute('defaults-on-match'),
						defaultActive: getLabels(this).filter((l) => l.hasAttribute('default-activate')),
					}
				}
			}

			this.observeAffordanceChange((matching, all) => {
				if (!this.__defaults) {
					this.__defaults = {
						onMatch: this.hasAttribute('defaults-on-match'),
						defaultActive: getLabels(this).filter((l) => l.hasAttribute('default-activate')),
					}
				}

				this.affordanceState.current = this.getAttribute('affordance')
				this.__configure()
			})

			this.setActiveAffordance = (matching, all) => {
				checkDefaults()

				this.setAttribute('affordance', matching)

				this.affordanceState.current = matching

				this.__configure()
			}

			this.attachShadow({ mode: 'open' })

			this.shadowRoot.innerHTML = template

			this.__tabListEl = this.shadowRoot.querySelector("[part='tab-list']")

			this.addEventListener('keydown', (evt) => {
				let labels = getLabels(this)
				let size = labels.length
				let cur = this.affordanceState.exclusiveSelection.index
				let prev = cur === 0 ? size - 1 : cur - 1
				let next = cur === size - 1 ? 0 : cur + 1

				// don't trap nested handling
				if (evt.target.parentElement !== evt.currentTarget) {
					return
				}

				if (this.affordanceState.current === 'tab-bar' || this.affordanceState.current === 'exclusive-collapse') {
					if (evt.key === 'ArrowLeft' || evt.key === 'ArrowUp') {
						labels[prev].affordanceState.activate()
						evt.preventDefault()
					} else if (evt.key === 'ArrowRight' || evt.key === 'ArrowDown') {
						labels[next].affordanceState.activate()
						evt.preventDefault()
					}
				} else if (evt.key === ' ' && this.affordanceState.current === 'collapse') {
					evt.preventDefault()
				}
			}, false)

			this.addEventListener('keyup', (evt) => {
				if (evt.key === ' ' && this.affordanceState.current === 'collapse') {
					evt.target.closest('[affordance]').affordanceState.activate()

					evt.preventDefault()
				}
			})
		}

		connectedCallback() {
			super.connectedCallback()

			// TODO: handle selection
			if (location.hash) {
				setTimeout(this.honourFragmentLink, 1)
			}

			window.addEventListener('hashchange', this.honourFragmentLink)

			// if you append a fragment with a pair, it should work
			this.__childListObserver.observe(this, { childList: true })
		}
	}

	customElements.define('spicy-sections', RegionSet)
})()
