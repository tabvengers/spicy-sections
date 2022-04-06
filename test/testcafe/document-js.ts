/** Returns the element at the given index of elements. */
export const at = Function(
	'elements',
	'index',
	[
		'index = Math.trunc(index) || 0',

		'if (index < 0) index += elements.length',

		'if (index < 0 || index >= elements.length) return null',

		'return elements[index]',
	].join('\n')
) as (elements: Element[], index: number) => Element | null

/** Returns the value of the given DOM property for the element. */
export const getProperty = Function(
	'element',
	'property',
	[
		'return element === Object(element) ? Reflect.get(element, property) : undefined'
	].join('\n')
) as (element: Element, property: PropertyKey) => any

/** Sets the value of the given DOM property for the element. Returns whether the operation completed successfully. */
export const setProperty = Function(
	'element',
	'property',
	'value',
	[
		'return element === Object(element) ? Reflect.set(element, property, value) : false'
	].join('\n')
) as (element: Element, property: PropertyKey, value: any) => boolean
