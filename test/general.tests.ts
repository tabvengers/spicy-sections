import * as $ from './testcafe'
import * as utils from './utils'

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

fixture('Panelset Responsive Affordances').page(PAGE_URL)

// Testing Setup
// -----------------------------------------------------------------------------

const panelset = $.document().find('oui-panelset')

// Testing
// -----------------------------------------------------------------------------

test(`Implements responsive 'disclosure' affordance`, async t => {
	await t.resizeWindow(...BREAKPOINTS.disclosure)

	// panelset element should switch to a `disclosure` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')

	/** Label elements contained by the Panelset element. */
	const shadowLabels = panelset.findByShadowPart('label')

	// panelset element should contain 3 elements matching the label part
	await t.expect(shadowLabels.count).eql(3)

	// verify qualities of each label
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(0), { isOpen: true })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(1), { isOpen: false })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(2), { isOpen: false })
})

test(`Implements responsive 'content' affordance`, async t => {
	await t.resizeWindow(...BREAKPOINTS.content)

	// panelset element should switch to a `content` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('content')

	/** Label elements contained by the Panelset element. */
	const shadowLabels = panelset.findByShadowPart('label')

	// panelset element should contain 3 elements matching the label part
	await t.expect(shadowLabels.count).eql(3)

	// verify qualities of each label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))
})

test(`Implements responsive 'tabset' affordance`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	// panelset element should switch to a `tabset` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('tabset')

	/** Label elements contained by the Panelset element. */
	const shadowLabels = panelset.findByShadowPart('label')

	// panelset element should contain 3 elements matching the label part
	await t.expect(shadowLabels.count).eql(3)

	// verify qualities of each label
	await utils.validateLabelInTabsetAffordance(t, shadowLabels.at(0), { isOpen: true })
	await utils.validateLabelInTabsetAffordance(t, shadowLabels.at(1), { isOpen: false })
	await utils.validateLabelInTabsetAffordance(t, shadowLabels.at(2), { isOpen: false })
})
