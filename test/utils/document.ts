import * as tld from '@testing-library/dom'
import * as testcafe from './testcafe'

declare const TestingLibraryDom: typeof tld

export const clientScript = '@testing-library/dom/dist/@testing-library/dom.umd.js'

export const document = () => testcafe.find(() => window.document).addCustomDOMProperties({
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
	matches(element, selector: string): boolean {
		return element instanceof Element ? Element.prototype.matches.call(element, selector) as boolean : false
	},
}).addCustomMethods({
	assigned(elements): Node[] {
		let results: Node[] = []

		for (let element of elements) {
			if (element instanceof HTMLSlotElement) {
				results.push(...element.assignedNodes())
			} else {
				for (let slot of element.querySelectorAll('slot')) {
					results.push(...slot.assignedNodes())
				}
			}
		}

		return results
	},
	at(elements, index: number): Element | null {
		index = Math.trunc(index) || 0
	
		if (index < 0) index += elements.length;
	
		if (index < 0 || index >= elements.length) return null;
	
		return elements[index];
	},
	find(elements, selector: string): Element[] {
		let [ , liteSelector, darkSelector = '' ] = selector.match(/^([\W\w]+?)(?:\::part\((.+)\))?$/)
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
}, {
	returnDOMNodes: true
})
