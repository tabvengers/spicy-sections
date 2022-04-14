import * as $ from './testcafe'

// Constants
// -----------------------------------------------------------------------------

const BREAKPOINTS = {
	disclosure: [ 400, 400 ],
	content: [ 600, 400 ],
	tabset: [ 800, 400 ],
} as const

// Fixture
// -----------------------------------------------------------------------------

fixture('Panelset Toggles').page('http://localhost:3000/demonstration/test-responsive/')

// Testing Setup
// -----------------------------------------------------------------------------

const panelset = $.document().find('oui-panelset')

// Testing
// -----------------------------------------------------------------------------

test(`Toggles panel in 'disclosure' affordance independently`, async t => {
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

test(`Toggles panel in 'tabset' affordance co-dependently`, async t => {
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
