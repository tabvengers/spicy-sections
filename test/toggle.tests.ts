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

fixture('Panelset Toggles').page(PAGE_URL)

// Testing Setup
// -----------------------------------------------------------------------------

const panelset = $.document().find('oui-panelset')

// Testing
// -----------------------------------------------------------------------------

test(`Supports toggling an individual 'disclosure' panel`, async t => {
	await t.resizeWindow(...BREAKPOINTS.disclosure)

	const shadowLabels = panelset.findByShadowPart('label')

	await t.expect(shadowLabels.at(0).part).contains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')

	await t.click(shadowLabels.at(0))

	await t.expect(shadowLabels.at(0).part).notContains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')

	await t.click(shadowLabels.at(0))

	await t.expect(shadowLabels.at(0).part).contains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')
})

test(`Supports toggling an individual 'tabset' panel`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	const shadowLabels = panelset.findByShadowPart('label')

	await t.expect(shadowLabels.at(0).part).contains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')

	await t.click(shadowLabels.at(0))

	await t.expect(shadowLabels.at(0).part).contains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')

	await t.click(shadowLabels.at(0))

	await t.expect(shadowLabels.at(0).part).contains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')

	await t.click(shadowLabels.at(1))

	await t.expect(shadowLabels.at(0).part).notContains('open')
	await t.expect(shadowLabels.at(1).part).contains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')

	await t.click(shadowLabels.at(2))

	await t.expect(shadowLabels.at(0).part).notContains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).contains('open')

	await t.click(shadowLabels.at(0))

	await t.expect(shadowLabels.at(0).part).contains('open')
	await t.expect(shadowLabels.at(1).part).notContains('open')
	await t.expect(shadowLabels.at(2).part).notContains('open')
})
