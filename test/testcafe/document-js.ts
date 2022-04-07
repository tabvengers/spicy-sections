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

/** Returns the value of the given DOM method for the element. */
export const invokeProperty = Function(
	'element',
	'property',
	'...args',
	[
		'if (element !== Object(element)) return undefined',

		'let callee = Reflect.get(element, property)',

		'if (typeof callee !== "function") return undefined',

		'let value = Function.call.call(callee, element, ...args)',

		'if (value !== Object(value)) return value',

		'return JSON.parse(JSON.stringify(value, replacer))',

		'function replacer(property, value) {',
			'if (value instanceof Element) return {',
				'constructor: { name: value.constructor.name },',
				'nodeType: value.nodeType,',
				'nodeName: value.nodeName,',
				'localName: value.localName,',
				'attributes: Object.fromEntries(',
					'Array.from(',
						'value.attributes,',
						'attr => [ attr.name, attr.value ]',
					')',
				'),',
				'innerHTML: value.innerHTML,',
				'textContent: value.textContent,',
			'}',

			'if (value instanceof Node) return {',
				'constructor: { name: value.constructor.name },',
				'nodeType: value.nodeType,',
				'nodeName: value.nodeName,',
				'nodeValue: value.nodeValue,',
				'textContent: value.textContent,',
			'}',

			'return value',
		'}',
	].join('\n')
) as (element: Element, property: PropertyKey, ...args: any) => any

/** Sets the value of the given DOM property for the element. Returns whether the operation completed successfully. */
export const setProperty = Function(
	'element',
	'property',
	'value',
	[
		'return element === Object(element) ? Reflect.set(element, property, value) : false'
	].join('\n')
) as (element: Element, property: PropertyKey, value: any) => boolean
