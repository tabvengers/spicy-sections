import * as $ from './utils/document'

// Constants
// -----------------------------------------------------------------------------

const PAGE_URL = 'http://localhost:3000/demonstration/'

const BREAKPOINTS = {
	disclosure: [ 640 - 60, 520 ],
	content: [ 800, 520 ],
	tabset: [ 960 + 60, 520 ],
} as const

// Fixture
// -----------------------------------------------------------------------------

fixture('Panelset').clientScripts({
	module: $.clientScript,
}).page(PAGE_URL)

// Testing Setup
// -----------------------------------------------------------------------------

const panelset = $.document().find('oui-panelset')

// Testing
// -----------------------------------------------------------------------------

test(`Supports 'disclosure' affordance when window is ${BREAKPOINTS.disclosure.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.disclosure)

	await t.expect(panelset.getProperty('affordance')).notEql('content')
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('tabset')

	const labels = panelset.findByPart('label')

	await t.expect(labels.count).eql(3)

	async function verifyDisclosureButton(label: typeof labels, isSelected: boolean) {
		await t.expect(label.role).eql('button')
		await t.expect(label.part).contains('label')
		await t.expect(label.part).contains('is-disclosure')
		await t.expect(label.part).notContains('is-content')
		await t.expect(label.part).notContains('is-tabset')

		if (isSelected) {
			await t.expect(label.part).contains('open')
		} else {
			await t.expect(label.part).notContains('open')
		}
	}

	await verifyDisclosureButton(labels.at(0), true)
	await verifyDisclosureButton(labels.at(1), false)
	await verifyDisclosureButton(labels.at(2), false)
})

test(`Supports 'content' affordance when window is ${BREAKPOINTS.content.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.content)

	await t.expect(panelset.getProperty('affordance')).eql('content')
	await t.expect(panelset.getProperty('affordance')).notEql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('tabset')

	const labels = panelset.findByPart('label,content')

	await t.expect(labels.matches('[part~="is-content"]')).eql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).notEql(true)
})

test(`Supports 'tabset' affordance when window is ${BREAKPOINTS.tabset.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	await t.expect(panelset.getProperty('affordance')).eql('tabset')
	await t.expect(panelset.getProperty('affordance')).notEql('disclosure')
	await t.expect(panelset.getProperty('affordance')).notEql('content')

	const labels = panelset.findByPart('label')

	await t.expect(labels.matches('[part~="is-content"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-disclosure"]')).notEql(true)
	await t.expect(labels.matches('[part~="is-tabset"]')).eql(true)
})

test(`Supports toggling an individual 'disclosure' panel`, async t => {
	await t.resizeWindow(...BREAKPOINTS.disclosure)

	const openLabel = panelset.findByPart('label').at(0)

	await t.expect(openLabel.part).contains('open')

	await t.click(openLabel)

	await t.expect(openLabel.part).notContains('open')

	await t.click(openLabel)

	await t.expect(openLabel.part).contains('open')
})

test(`Correctly assigns content to ShadowDOM`, async (t) => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	const openLabel = panelset.findByPart('label').at(0)
	const h3 = openLabel.assigned()

	await t.expect(h3.count).eql(1)
	await t.expect(h3.tagName).eql('h3')
	await t.expect(h3.textContent).eql('Tabset')
})

test(`Verify a "tab"`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	const openLabel = panelset.findByPart('label is-tabset open')

	await t.expect(openLabel.count).eql(1)

	await t.expect(openLabel.assigned().textContent).eql('Tabset')

	await t.expect(openLabel.getAttribute('aria-controls')).eql('content-0')
	await t.expect(openLabel.getAttribute('aria-selected')).eql('true')
	await t.expect(openLabel.getAttribute('id')).eql('label-0')
	await t.expect(openLabel.getAttribute('part')).eql('label is-tabset open')
	await t.expect(openLabel.getAttribute('role')).eql('tab')
	await t.expect(openLabel.getAttribute('tabindex')).eql('0')
})
