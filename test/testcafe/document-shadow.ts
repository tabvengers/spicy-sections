/** Returns the part names for the element. */
export const part = Function(
	'element',
	[
		'return Array.from(Reflect.get(element, "part"))'
	].join('\n')
) as (element: Element) => string[]

/** Returns nodes assigned to the `<slot>` elements. */
export const assignedNodes = Function(
	'elements',
	[
		'let results = []',

		'for (let element of elements) {',
			'if (element instanceof HTMLSlotElement) {',
				'results.push(...element.assignedNodes())',
			'}',
		'}',

		'return results',
	].join('\n')
) as (elements: Element[]) => Node[]

/** Returns slot elements assigned the elements. */
export const assignedSlot = Function(
	'elements',
	[
		'let results = []',

		'for (let element of elements) {',
			'const assignedSlot = element.assignedSlot',

			'if (assignedSlot) {',
				'results.push(assignedSlot)',
			'}',
		'}',

		'return results',
	].join('\n')
) as (elements: Element[]) => Element[]

/** Returns shadow elements matching the given part names. */
export const findByShadowPart = Function(
	'elements',
	'parts = null',
	[
		'parts = parts == null ? "" : String(parts).trim()',

		'let selector = parts.split(/\\s*,\\s*/).map(',
			'partNames => partNames.split(/\\s+/).map(partName => partName ? `[part~="${partName}"]` : "[part]").join("")',
		').join(",")',

		'let results = []',

		'for (let element of elements) {',
			'let { shadowRoot } = element',

			'results.push(...shadowRoot.querySelectorAll(selector))',
		'}',

		'return results',
	].join('\n')
) as (elements: Element[], parts: string) => HTMLSlotElement[]

/** Returns slotted elements matching the (optional) given selector. */
export const slotted = Function(
	'elements',
	'match = null',
	[
		'let results = []',

		'for (let element of elements) {',
			'if (element instanceof HTMLSlotElement) {',
				'addSlotAssignedNodes(element)',
			'} else {',
				'for (let slot of element.querySelectorAll("slot")) {',
					'addSlotAssignedNodes(slot)',
				'}',
			'}',
		'}',

		'function addSlotAssignedNodes(slot) {',
			'for (const node of slot.assignedNodes()) {',
				'addAssignedNode(node)',
			'}',
		'}',

		'function addAssignedNode(node) {',
			'if (match == null || (node instanceof Element && node.matches(match))) {',
				'results.push(node)',
			'}',
		'}',

		'return results',
	].join('\n')
) as (elements: Element[], match?: string) => Node[]
