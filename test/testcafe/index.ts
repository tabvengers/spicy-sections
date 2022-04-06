import * as testcafe from './testcafe'
import * as aria from './document-aria'
import * as dom from './document-dom'
import * as js from './document-js'
import * as shadow from './document-shadow'

export * from './testcafe'

export const document = () => testcafe.Selector(() => window.document).addCustomDOMProperties({
	/** Returns the computed ARIA level for the element. */
	ariaLevel: aria.ariaLevel,
	/** Returns the computed ARIA roles for the element. */
	ariaRole: aria.ariaRole,
	/** Returns the part names for the element. */
	part: shadow.part,
}).addCustomMethods({
	/** Returns the value of the given DOM property for the element. */
	getProperty: js.getProperty,
	/** Returns the computed value of the given CSS property for the element. */
	getCSSProperty: dom.getCSSProperty,
	/** Returns whether the given selector matches the element. */
	matches: dom.matches,
	/** Sets the value of the given attribute for the element. Returns whether the operation completed successfully. */
	setAttribute: dom.setAttribute,
	/** Sets the value of the given CSS property for the element. Returns whether the operation completed successfully. */
	setCSSProperty: dom.setCSSProperty,
	/** Sets the value of the given DOM property for the element. Returns whether the operation completed successfully. */
	setProperty: js.setProperty,
}).addCustomMethods({
	/** Returns nodes assigned to the `<slot>` elements. */
	assignedNodes: shadow.assignedNodes,
	/** Returns slot elements assigned the elements. */
	assignedSlot: shadow.assignedSlot,
	/** Returns the element at the given index of elements. */
	at: js.at,
	/** Returns the element or closest ancestor matching the given selector. */
	closest: dom.closest,
	/** Returns elements matching the given computed ARIA role. */
	findByAriaRole: aria.findByAriaRole,
	/** Returns shadow elements matching the given part names. */
	findByShadowPart: shadow.findByShadowPart,
	/** Returns slotted elements matching the (optional) given selector. */
	slotted: shadow.slotted,
}, {
	returnDOMNodes: true
})

export type DocumentSelector = ReturnType<typeof document>
export type TestController = globalThis.TestController
