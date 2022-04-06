import * as testcafe from './testcafe'
import * as aria from './document-aria'
import * as dom from './document-dom'
import * as js from './document-js'
import * as shadow from './document-shadow'

export const document = () => testcafe.find(() => window.document).addCustomDOMProperties({
	part: shadow.part,
	computedHeadingLevel: aria.computedHeadingLevel,
	computedRoles: aria.computedRoles,
}).addCustomMethods({
	getProperty: js.getProperty,
	matches: dom.matches,
	setProperty: js.setProperty,
}).addCustomMethods({
	assignedNodes: shadow.assignedNodes,
	assignedSlot: shadow.assignedSlot,
	at: js.at,
	closest: dom.closest,
	findByComputedRole: aria.findByComputedRole,
	findByShadowPart: shadow.findByShadowPart,
	slotted: shadow.slotted,
}, {
	returnDOMNodes: true
})

export type SelectorAPI = ReturnType<typeof document>
export type TestController = globalThis.TestController
