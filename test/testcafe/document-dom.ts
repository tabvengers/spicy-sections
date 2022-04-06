/** Returns whether the given selector matches the element. */
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

/** Sets the value of the given attribute for the element. Returns whether the operation completed successfully. */
export const setAttribute = Function(
	'element',
	'attribute',
	'value',
	[
		'element.setAttribute(attribute, value); return true',
	].join('\n')
) as (element: Element, attribute: string, value: string) => boolean

/** Returns the computed value of the given CSS property for the element. */
export const getCSSProperty = Function(
	'element',
	'property',
	[
		'return getComputedStyle(element).getPropertyValue(property)',
	].join('\n')
) as (element: Element, property: string) => string

/** Sets the value of the given CSS property for the element. Returns whether the operation completed successfully. */
export const setCSSProperty = Function(
	'element',
	'property',
	'value',
	[
		'element.style.setProperty(property, value); return true',
	].join('\n')
) as (element: Element, property: string, value: string) => boolean
