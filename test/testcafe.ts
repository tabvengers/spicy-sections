import * as t from 'testcafe'

export interface SelectorAPI {
	/**
	 * The number of child HTML elements.
	 */
	childElementCount: Promise<number>;
	/**
	 * The number of child nodes.
	 */
	childNodeCount: Promise<number>;
	/**
	 * `true` if this node has child HTML elements.
	 */
	hasChildElements: Promise<boolean>;
	/**
	 * `true` if this node has child nodes.
	 */
	hasChildNodes: Promise<boolean>;
	/**
	 * The type of the node.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
	 */
	nodeType: Promise<number>;
	/**
	 * The text content of the node and its descendants.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
	 */
	textContent: Promise<string>;
	/**
	 * Attributes of the element.
	 */
	attributes: Promise<{[name: string]: string}>;
	/**
	 * The size of the element and its position relative to the viewport.
	 */
	boundingClientRect: Promise<TextRectangle>;
	/**
	 * For checkbox and radio input elements, their current state. For other elements, `undefined`.
	 */
	checked: Promise<boolean | undefined>;
	/**
	 * The list of element's classes.
	 */
	classNames: Promise<string[]>;
	/**
	 * The inner height of the element, including padding but not the horizontal scrollbar height, border, or margin.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
	 */
	clientHeight: Promise<number>;
	/**
	 * The width of the left border of the element.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
	 */
	clientLeft: Promise<number>;
	/**
	 * The width of the top border of the element.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
	 */
	clientTop: Promise<number>;
	/**
	 * The inner width of the element, including padding but not the vertical scrollbar width, border, or margin.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
	 */
	clientWidth: Promise<number>;
	/**
	 * `true` if the element is focused.
	 */
	focused: Promise<boolean>;
	/**
	 * The element's identifier.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/id
	 */
	id: Promise<string>;
	/**
	 * The element's text content "as rendered".
	 * See https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
	 */
	innerText: Promise<string>;
	/**
	 *    The namespace URI of the element. If the element does not have a namespace, this property is set to null.
	 *    See https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI
	 */
	namespaceURI: Promise<string | null>;
	/**
	 * The height of the element including vertical padding and borders.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
	 */
	offsetHeight: Promise<number>;
	/**
	 * The number of pixels that the upper left corner of the element is offset by to the left within the `offsetParent` node.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
	 */
	offsetLeft: Promise<number>;
	/**
	 * The number of pixels that the upper left corner of the element is offset by to the top within the offsetParent node.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
	 */
	offsetTop: Promise<number>;
	/**
	 * The width of the element including vertical padding and borders.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
	 */
	offsetWidth: Promise<number>;
	/**
	 * Indicates that `<option>` element is currently selected. For other elements, `undefined`.
	 */
	selected: Promise<boolean | undefined>;
	/**
	 *    For `<select>` element, the index of the first selected `<option>` element. For other elements, `undefined`.
	 */
	selectedIndex: Promise<number | undefined>;
	/**
	 * The height of the element's content, including content not visible on the screen due to overflow.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
	 */
	scrollHeight: Promise<number>;
	/**
	 * The number of pixels that the element's content is scrolled to the left.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
	 */
	scrollLeft: Promise<number>;
	/**
	 * The number of pixels that the element's content is scrolled upward.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
	 */
	scrollTop: Promise<number>;
	/**
	 * Either the width in pixels of the element's content or the width of the element itself, whichever is greater.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
	 */
	scrollWidth: Promise<number>;
	/**
	 * The computed values of element's CSS properties.
	 */
	style: Promise<{[prop: string]: string}>;
	/**
	 * The name of the element.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
	 */
	tagName: Promise<string>;
	/**
	 * For input elements, the current value in the control. For other elements, `undefined`.
	 */
	value: Promise<string | undefined>;
	/**
	 * `true` if the element is visible.
	 */
	visible: Promise<boolean>;
	/**
	 * `true` if the element has the specified class name.
	 *
	 * @param className - The name of the class.
	 */
	hasClass(className: string): Promise<boolean>;
	/**
	 * Returns the computed value of the CSS property.
	 *
	 * @param propertyName - The name of the CSS property.
	 */
	getStyleProperty(propertyName: string): Promise<string>;
	/**
	 *    Returns the value of the attribute.
	 *
	 * @param attributeName - The name of the attribute.
	 */
	getAttribute(attributeName: string): Promise<string | null>;
	/**
	 * Returns the value of the property from the `boundingClientRect` object.
	 *
	 * @param propertyName - The name of the property.
	 */
	getBoundingClientRectProperty(propertyName: string): Promise<number>;
	/**
	 * `true` if the element has the attribute.
	 *
	 * @param attributeName - The name of the attribute.
	 */
	hasAttribute(attributeName: string): Promise<boolean>;
	/**
	 * Creates a selector that returns an element's `shadowRoot`.
	 */
	shadowRoot(): this;
	/**
	 * Creates a selector that returns an element by its index in the matching set.
	 *
	 * @param index - A zero-based index of the element. If negative, then counted from the end of the matching set.
	 */
	nth(index: number): this;
	/**
	 * Creates a selector that filters a matching set by the specified text.
	 *
	 * @param text - The text in the element.
	 */
	withText(text: string): this;
	/**
	 * Creates a selector that filters a matching set using the specified regular expression.
	 *
	 * @param re - The regular expression for the text in the element.
	 */
	withText(re: RegExp): this;
	/**
	 * Creates a selector that filters a matching set by the specified text. Selects elements whose text content *strictly matches* this text.
	 *
	 * @param text - The text in the element.
	 */
	withExactText(text: string): this;
	/**
	 * Creates a selector that filters a matching set by the specified attribute and, optionally, attribute value.
	 *
	 * @param attrName - The attribute name.
	 * @param attrValue - The attribute value.You can omit this parameter to select elements that have
	 * the `attrName` attribute regardless of the value.
	 */
	withAttribute(attrName: string | RegExp, attrValue?: string | RegExp): this;
	/**
	 * Creates a selector that filters a matching set by cssSelector.
	 *
	 * @param cssSelector - A CSS selector string.
	 */
	filter(cssSelector: string): this;
	/**
	 * Creates a selector that filters a matching set by the `filterFn` predicate.
	 *
	 * @param filterFn - The predicate.
	 * @param filterFn `node` - The current DOM node.
	 * @param filterFn `idx` - Index of the current node among other nodes in the matching set.
	 * @param dependencies - Predicate dependencies.
	 */
	filter(filterFn: (node: Element, idx: number) => boolean,
		   dependencies?: {[key: string]: any}): this;
	/**
	 * Creates a selector that filters a matching set leaving only visible elements.
	 */
	filterVisible(): this;
	/**
	 * Creates a selector that filters a matching set leaving only hidden elements.
	 */
	filterHidden(): this;
	/**
	 * Finds all descendants of all nodes in the matching set and filters them by `cssSelector`.
	 *
	 * @param cssSelector - A CSS selector string.
	 */
	find(cssSelector: string): this;
	/**
	 * Finds all descendants of all nodes in the matching set and filters them using `filterFn` predicate.
	 *
	 * @param filterFn - The predicate.
	 * @param filterFn `node` - The current descendant node.
	 * @param filterFn `idx` - A zero-based index of `node` among other descendant nodes.
	 * @param filterFn `originNode` - A node from the left-hand selector's matching set whose descendants are being iterated.
	 * @param dependencies - Predicate dependencies.
	 */
	find(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
		 dependencies?: {[key: string]: any}): this;
	/**
	 * Finds all parents of all nodes in the matching set (first element in the set will be the closest parent).
	 */
	parent(): this;
	/**
	 * Finds all parents of all nodes in the matching set and filters them by `index`.
	 *
	 * @param index - A zero-based index of the parent (0 is the closest). If negative, then counted from the end of the matching set.
	 */
	parent(index: number): this;
	/**
	 * Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
	 *
	 * @param cssSelector - A CSS selector string.
	 */
	parent(cssSelector: string): this;
	/**
	 * Finds all parents of all nodes in the matching set and filters them by the `filterFn` predicate.
	 *
	 * @param filterFn - The predicate.
	 * @param filterFn `node` - The current parent node.
	 * @param filterFn `idx` - A zero-based index of `node` among other parent nodes.
	 * @param filterFn `originNode` - A node from the left-hand selector's matching set whose parents are being iterated.
	 * @param dependencies - Predicate dependencies.
	 */
	parent(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
		   dependencies?: {[key: string]: any}): this;
	/**
	 * Finds all child elements (not nodes) of all nodes in the matching set.
	 */
	child(): this;
	/**
	 * Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`.
	 *
	 * @param index - A zero-based index of the child. If negative, then counted from the end of the matching set.
	 */
	child(index: number): this;
	/**
	 * Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
	 *
	 * @param cssSelector - A CSS selector string.
	 */
	child(cssSelector: string): this;
	/**
	 * Finds all child elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
	 *
	 * @param filterFn - The predicate.
	 * @param filterFn `node` - The current child node.
	 * @param filterFn `idx` - A zero-based index of `node` among other child nodes.
	 * @param filterFn `originNode` - A node from the left-hand selector's matching set children parents are being iterated.
	 * @param dependencies - Predicate dependencies.
	 */
	child(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
		  dependencies?: {[key: string]: any}): this;
	/**
	 * Finds all sibling elements (not nodes) of all nodes in the matching set.
	 */
	sibling(): this;
	/**
	 * Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
	 *
	 * @param index -  a zero-based index of the sibling. If negative, then counted from the end of the matching set.
	 */
	sibling(index: number): this;
	/**
	 * nds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
	 *
	 * @param cssSelector - A CSS selector string.
	 */
	sibling(cssSelector: string): this;
	/**
	 * Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
	 *
	 * @param filterFn - The predicate.
	 * @param filterFn `node` - The current sibling node.
	 * @param filterFn `idx` - A zero-based index of `node` among other sibling nodes.
	 * @param filterFn `originNode` - A node from the left-hand selector's matching set whose siblings are being iterated.
	 * @param dependencies - Predicate dependencies.
	 */
	sibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
			dependencies?: {[key: string]: any}): this;
	/**
	 * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set.
	 */
	nextSibling(): this;
	/**
	 * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
	 *
	 * @param index - A zero-based index of the succeeding sibling. If negative, then counted from the end of the matching set.
	 */
	nextSibling(index: number): this;
	/**
	 * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
	 *
	 * @param cssSelector - A CSS selector string.
	 */
	nextSibling(cssSelector: string): this;
	/**
	 * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
	 *
	 * @param filterFn - The predicate.
	 * @param filterFn `node` - The current succeeding sibling node.
	 * @param filterFn `idx` - A zero-based index of `node` among other succeeding sibling nodes.
	 * @param filterFn `originNode` - A node from the left-hand selector's matching set whose succeeding siblings are being iterated.
	 * @param dependencies - Predicate dependencies.
	 */
	nextSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
				dependencies?: {[key: string]: any}): this;
	/**
	 * Finds all preceding sibling elements (not nodes) of all nodes in the matching set.
	 */
	prevSibling(): this;
	/**
	 *  Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
	 *
	 * @param index - A zero-based index of the preceding sibling. If negative, then counted from the end of the matching set.
	 */
	prevSibling(index: number): this;
	/**
	 * Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
	 *
	 * @param cssSelector - A CSS selector string.
	 */
	prevSibling(cssSelector: string): this;
	/**
	 * Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
	 *
	 * @param filterFn - The predicate.
	 * @param filterFn `node` - The current preceding sibling node.
	 * @param filterFn `idx` - A zero-based index of `node` among other preceding sibling nodes.
	 * @param filterFn `originNode` - A node from the left-hand selector's matching set whose preceding siblings are being iterated.
	 * @param dependencies - Predicate dependencies.
	 */
	prevSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
				dependencies?: {[key: string]: any}): this;
	/**
	 * `true if` at least one matching element exists.
	 */
	exists: Promise<boolean>;
	/**
	 * The number of matching elements.
	 */
	count: Promise<number>;
	/**
	 *  Adds custom selector properties.
	 *
	 * @param props - Property descriptors.
	 * @param props `prop` - Property name.
	 * @param props `[prop]` - The function that calculate property values. Executed on the client side in the browser.
	 * @param props `node` - The matching DOM node for which custom property is calculated.
	 */
	addCustomDOMProperties(props: {[prop: string]: (node: Element) => any}): this;

	/** Adds custom selector methods. */
	addCustomMethods<T extends {
		[method: string]: (node?: Element, ...methodParams: any[]) => any
	}, B extends true | false = false>(
		methods: T,
		opts?: {
			returnDOMNodes?: B
		}
	): this & (
		B extends true
			? WithCustomMethods<this, T>
		: {
			[K in keyof T]: T[K] extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never
		}
	);

	/**
	 * Returns a new selector with a different set of options that includes options from the
	 * original selector and new `options` that overwrite the original ones.
	 *
	 * @param options - New options.
	 */
	with(options?: SelectorOptions): this;
}

type WithCustomMethods<T extends SelectorAPI, M extends {
	[method: string]: (node?: Element, ...methodParams: any[]) => any
}> = T & {
	[K in keyof M]: M[K] extends (x: any, ...args: infer P) => any ? (...args: P) => WithCustomMethods<T, M> : never
}

export interface SelectorFactory {
	(
		init:
			| string
			| ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)
			| Selector
			| SelectorAPI
			| NodeSnapshot
			| SelectorPromise,
		options?: SelectorOptions
	): SelectorAPI;
}

export const querySelectorAll = t.Selector as unknown as SelectorFactory
