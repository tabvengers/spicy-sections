import { Selector } from 'testcafe'
import Utils from './utils/helpers'

const utils = new Utils()

const BREAKPOINTS = {
	disclosure: 640 - 60,
	content: 800,
	tabset: 960 + 60,
}

fixture`Panelset`.page`http://localhost:3000/demonstration/`

const panelset = Selector('oui-panelset').addCustomMethods({
	getAffordanceProperty(panelsetElement) {
		return panelsetElement.affordance;
	},
})

test(`Supports 'disclosure' affordance when window is ${BREAKPOINTS.disclosure}px wide`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.disclosure, 1080)
	await t.expect(panelset.getAffordanceProperty()).eql('disclosure')
	await t.expect(panelset.getAffordanceProperty()).notEql('tabset')
	await t.expect(panelset.getAffordanceProperty()).notEql('content')
})

test(`Supports 'content' affordance when window is ${BREAKPOINTS.content}px wide`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.content, 1080)
	await t.expect(panelset.getAffordanceProperty()).eql('content')
	await t.expect(panelset.getAffordanceProperty()).notEql('disclosure')
	await t.expect(panelset.getAffordanceProperty()).notEql('tabset')
})

test(`Supports 'tabset' affordance when window is ${BREAKPOINTS.tabset}px wide`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.tabset, 1080)
	await t.expect(panelset.getAffordanceProperty()).eql('tabset')
	await t.expect(panelset.getAffordanceProperty()).notEql('disclosure')
	await t.expect(panelset.getAffordanceProperty()).notEql('content')
})

test('Supports disclosure affordance ShadowDOM', async t => {
	await t.resizeWindow(BREAKPOINTS.disclosure, 1080)

	const shadowRoot = panelset.shadowRoot()
	const panels = shadowRoot.find((node, idx, originNode) => originNode.part && originNode.part.has('label'))

	console.log(await panelset.count)
	console.log(await panels.count) // this needs to be 3!
})

test('Supports tabset affordance ShadowDOM', async t => {
	await t.resizeWindow(BREAKPOINTS.disclosure, 1080)

	// const shadowRoot = panelset.shadowRoot()
	// const panels = shadowRoot.find((node, idx, originNode) => originNode.part && originNode.part.has('label'))

	// console.log(await panelset.count)
	// console.log(await panels.count) // this needs to be 3!
});