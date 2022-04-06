/** Returns whether the element matches the given selector. */
export const matches = Function(
	'element',
	'selector',
	[
		'return element instanceof Element && element.matches(selector)'
	].join('\n')
) as (element: Element, match: string) => boolean

/** Returns the element or closest ancestor matching the given selector. */
export const closest = Function(
	'elements',
	'selector',
	[
		'let results = []',

		'for (let element of elements) {',
			'let closestElement = element.closest(selector)',

			'if (closestElement) {',
				'results.push(closestElement)',
			'}',
		'}',

		'return results',
	].join('\n')
) as (elements: Element[], selector: string) => Element[]