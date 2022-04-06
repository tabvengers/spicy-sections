import * as testcafe from './testcafe'
import * as aria from './aria'

export const document = () => testcafe.find(() => window.document).addCustomDOMProperties({
	outerHTML(element): string {
		return Reflect.get(element, 'outerHTML')
	},
	part(element): string[] {
		return Array.from(Reflect.get(element, 'part'))
	},
	role: aria.getRoles,
}).addCustomMethods({
	getProperty(element, property: PropertyKey): any {
		return element === Object(element) ? Reflect.get(element, property) : undefined
	},
	matches(element, match: string): boolean {
		return element instanceof Element ? Element.prototype.matches.call(element, match) as boolean : false
	},
}).addCustomMethods({
	assignedNodes(elements): Node[] {
		let results: Node[] = []

		for (let element of elements) {
			if (element instanceof HTMLSlotElement) {
				results.push(...element.assignedNodes())
			}
		}

		return results
	},
	assignedSlot(elements): Element[] {
		let results: Element[] = []

		for (let element of elements) {
			const assignedSlot = (element as any).assignedSlot()

			if (assignedSlot) {
				results.push(assignedSlot)
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
	findByRole: aria.findByRole,
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

export type SelectorAPI = ReturnType<typeof document>
export type TestController = globalThis.TestController
