import * as testcafe from './testcafe'
import * as aria from './document-aria'
import * as dom from './document-dom'
import * as js from './document-js'
import * as shadow from './document-shadow'

export * from './testcafe'

export const document = () => testcafe.Selector(() => window.document).addCustomDOMProperties({
	/** Returns the computed heading level for the element. */
	ariaLevel: aria.ariaLevel,
	/** Returns the computed roles for the element. */
	ariaRole: aria.ariaRole,
	/** Returns an array of parts assigned to the element. */
	part: shadow.part,
}).addCustomMethods({
	/** Returns the value of the given property on the element. */
	getProperty: js.getProperty,
	/** Returns the style value of the given css property for the element. */
	getCSSProperty: dom.getCSSProperty,
	/** Returns whether the element matches the given selector. */
	matches: dom.matches,
	/** Sets the value of the given property on the element and returns whether the set was successful. */
	setProperty: js.setProperty,
}).addCustomMethods({
	/** Returns nodes assigned to the slot elements. */
	assignedNodes: shadow.assignedNodes,
	/** Returns slot elements assigned to the elements. */
	assignedSlot: shadow.assignedSlot,
	/** Returns the element at the given index of elements. */
	at: js.at,
	/** Returns the element or closest ancestor matching the given selector. */
	closest: dom.closest,
	/** Returns elements matching the given role. */
	findByComputedRole: aria.findByComputedRole,
	/** Returns shadow elements matching the given part selector. */
	findByShadowPart: shadow.findByShadowPart,
	/** Returns slotted elements optionally matching the given selector. */
	slotted: shadow.slotted,
}, {
	returnDOMNodes: true
})

export type DocumentSelector = ReturnType<typeof document>
export type TestController = globalThis.TestController
