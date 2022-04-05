import * as tld from '@testing-library/dom'
import * as testcafe from './testcafe'

declare const TestingLibraryDom: typeof tld

export const clientScript = '@testing-library/dom/dist/@testing-library/dom.umd.js'

export const document = () => testcafe.find(() => window.document).addCustomDOMProperties({
	outerHTML(element): string {
		return Reflect.get(element, 'outerHTML')
	},
	part(element): string[] {
		return Array.from(Reflect.get(element, 'part'))
	},
	role(element): string | null {
		for (let [ role, elements ] of Object.entries(TestingLibraryDom.getRoles(element as HTMLElement))) {
			if (elements.includes(element as HTMLElement)) {
				return role
			}
		}

		return null
	},
}).addCustomMethods({
	getProperty(element, property: PropertyKey): any {
		return element === Object(element) ? Reflect.get(element, property) : undefined
	},
	matches(element, match: string): boolean {
		return element instanceof Element ? Element.prototype.matches.call(element, match) as boolean : false
	},
}).addCustomMethods({
	at(elements, index: number): Element | null {
		index = Math.trunc(index) || 0
	
		if (index < 0) index += elements.length;
	
		if (index < 0 || index >= elements.length) return null;
	
		return elements[index];
	},
	find(elements, match: string): Element[] {
		let [ , liteSelector, darkSelector = '' ] = match.match(/^([\W\w]+?)(?:\::part\((.+)\))?$/)
		let results: Element[] = []

		for (let element of elements) {
			let liteElements = element.querySelectorAll(liteSelector)

			if (darkSelector) {
				for (let lightElement of liteElements) {
					if (lightElement.shadowRoot) {
						let darkElements = lightElement.shadowRoot.querySelectorAll(darkSelector.split(/\s+/).map(part => `[part~="${part}"]`).join(''))

						results.push(...darkElements)
					}
				}
			} else {
				results.push(...liteElements)
			}
		}

		return results
	},
	findByPart(elements, parts: string): Element[] {
		parts = parts.trim().split(',').map(
			parts => parts.trim().split(/\s+/).map(part => `[part~="${part}"]`).join('')
		).join(',')

		let results: Element[] = []

		for (let element of elements) {
			let { shadowRoot } = element

			results.push(...shadowRoot.querySelectorAll(parts))
		}

		return results
	},
	findByRole(elements, match: tld.ByRoleMatcher, options?: tld.ByRoleOptions): Element[] {
		let results: Element[] = []

		for (let element of elements) {
			let roleElements = TestingLibraryDom.queryAllByRole(element as HTMLElement, match, options)

			results.push(...roleElements)
		}

		results = [ ...new Set(results) ]

		return results
	},
	slotted(elements, match?: string): Node[] {
		let results: Node[] = []

		for (let element of elements) {
			if (element instanceof HTMLSlotElement) {
				addSlot(element)
			} else {
				for (let slot of element.querySelectorAll('slot')) {
					addSlot(slot)
				}
			}
		}

		function addSlot(slot: HTMLSlotElement) {
			for (const node of slot.assignedNodes()) {
				addNode(node)
			}
		}

		function addNode(node: Node) {
			if (match == null || (node instanceof Element && node.matches(match))) {
				results.push(node)
			}
		}

		return results
	},
}, {
	returnDOMNodes: true
})
