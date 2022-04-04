import * as $ from './utils/testcafe'

const BREAKPOINTS = {
	disclosure: [ 640 - 60, 520 ],
	content: [ 800, 520 ],
	tabset: [ 960 + 60, 520 ],
} as const

fixture('Panelset').clientScripts({
	content: ['(', () => {
		const __shadowRoot = globalThis.__shadowRoot = new WeakMap()

		const { attachShadow } = Element.prototype

		Object.assign(Element.prototype, {
			attachShadow(...args) {
				const returnValue = Function.call.call(attachShadow, this, ...args)

				__shadowRoot.set(this, returnValue)

				return returnValue
			}
		})
	}, ')()'].join('')
}).page('http://localhost:3000/demonstration/');

const document = $.document()

const panelset = document.query('oui-panelset')

test(`Supports 'disclosure' affordance when window is ${BREAKPOINTS.disclosure.join('x')} wide`, async (t) => {
	await t.resizeWindow(...BREAKPOINTS.disclosure)

	await t.expect(panelset.getProperty('affordance')).notEql('content')
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('tabset')

	const labels = panelset.shadowRoot().find('[part~="label"]')

	await t.expect(labels.matches('[part~="is-content"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).eql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).notEql(true)
})

test(`Supports 'content' affordance when window is ${BREAKPOINTS.content.join('x')} wide`, async (t) => {
	await t.resizeWindow(...BREAKPOINTS.content)

	await t.expect(panelset.getProperty('affordance')).eql('content')
	await t.expect(panelset.getProperty('affordance')).notEql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('tabset')

	const labels = panelset.shadowRoot().find('[part~="label"],[part~="content"]')

	await t.expect(labels.matches('[part~="is-content"]')).eql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).notEql(true)
})

test(`Supports 'tabset' affordance when window is ${BREAKPOINTS.tabset.join('x')} wide`, async (t) => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	await t.expect(panelset.getProperty('affordance')).eql('tabset')
	await t.expect(panelset.getProperty('affordance')).notEql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('content')

	const labels = panelset.shadowRoot().find('[part~="label"]')

	await t.expect(labels.matches('[part~="is-content"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).eql(true)
})

test(`Supports toggling an individual 'disclosure' panel`, async (t) => {
	await t.resizeWindow(...BREAKPOINTS.disclosure)

	const openLabel = panelset.part('label').nth(0)

	await t.expect(openLabel.hasPart('open')).eql(true)

	await t.click(openLabel)

	await t.expect(openLabel.hasPart('open')).eql(false)

	await t.click(openLabel)

	await t.expect(openLabel.hasPart('open')).eql(true)
})

test(`Correctly assigns content to ShadowDOM`, async (t) => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	const openLabel = panelset.part('label').nth(0)
	const h3 = openLabel.slotted()

	await t.expect(h3.count).eql(1)
	await t.expect(h3.tagName).eql('h3')
	await t.expect(h3.textContent).eql('Tabset')
})
