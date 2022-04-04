import * as t from './testcafe'

const BREAKPOINTS = {
	disclosure: 640 - 60,
	content: 800,
	tabset: 960 + 60,
}

// Just avoid magic number or 'too big' errors
const WINDOW_HEIGHT = 800;

fixture`Panelset`.page`http://localhost:3000/demonstration/`

const panelset = t.querySelectorAll('oui-panelset').addCustomMethods({
	getProperty(target: Element, property: PropertyKey) {
		return target === Object(target) ? Reflect.get(target, property) : undefined;
	},
	matches(target: Element, selector: string) {
		return target instanceof Element ? Element.prototype.matches.call(target, selector) as boolean : false
	},
	outerHTML(target: Element) : string | null {
		return target.outerHTML
	},
}).addCustomMethods({
	assignedElements(elements: Element[]) {
		const nodeList = []
		for (const target of elements as HTMLSlotElement[]) {
			nodeList.push(...target.assignedElements())
		}
		return nodeList
	},
	querySelectorAll(elements: Element[], selector: string) {
		const nodeList = []
		for (const target of elements) {
			nodeList.push(...target.querySelectorAll(selector))
		}
		return nodeList
	},
}, { returnDOMNodes: true })

test(`Supports 'disclosure' affordance when window is ${BREAKPOINTS.disclosure}px wide`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.disclosure, WINDOW_HEIGHT)

	await t.expect(panelset.getProperty('affordance')).notEql('content')
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('tabset')

	const labels = panelset.shadowRoot().find('[part~="label"]')

	await t.expect(labels.matches('[part~="is-content"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).eql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).notEql(true)
})

test(`Supports 'content' affordance when window is ${BREAKPOINTS.content}px wide`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.content, WINDOW_HEIGHT)

	await t.expect(panelset.getProperty('affordance')).eql('content')
	await t.expect(panelset.getProperty('affordance')).notEql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('tabset')

	const labels = panelset.shadowRoot().find('[part~="label"],[part~="content"]')

	await t.expect(labels.matches('[part~="is-content"]')).eql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).notEql(true)
})

test(`Supports 'tabset' affordance when window is ${BREAKPOINTS.tabset}px wide`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.tabset, WINDOW_HEIGHT)

	await t.expect(panelset.getProperty('affordance')).eql('tabset')
	await t.expect(panelset.getProperty('affordance')).notEql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('content')

	const labels = panelset.shadowRoot().find('[part~="label"]')

	await t.expect(labels.matches('[part~="is-content"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).eql(true)
})

test(`Supports toggling an individual 'disclosure' panel`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.disclosure, WINDOW_HEIGHT)

	const openLabel = panelset.shadowRoot().find('[part~="label"]').nth(0)

	await t.expect(openLabel.matches('[part~="open"]')).eql(true)

	await t.click(openLabel as unknown as Selector)

	await t.expect(openLabel.matches('[part~="open"]')).eql(false)

	await t.click(openLabel as unknown as Selector)

	await t.expect(openLabel.matches('[part~="open"]')).eql(true)
})

test(`Correctly assigns content to ShadowDOM`, async (t) => {
	await t.resizeWindow(BREAKPOINTS.tabset, WINDOW_HEIGHT)

	const openLabel = panelset.shadowRoot().find('[part~="label"]').nth(0)
	const h3 = openLabel.querySelectorAll('slot').assignedElements()

	await t.expect(h3.count).eql(1)
	await t.expect(h3.tagName).eql('h3')
	await t.expect(h3.textContent).eql('Tabset')
})
