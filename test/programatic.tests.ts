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

fixture('Panelset Programatic Affordances').page(PAGE_URL)

// Testing Setup
// -----------------------------------------------------------------------------

const panelset = $.document().find('oui-panelset')

// Testing
// -----------------------------------------------------------------------------

test(`Implements programatic 'disclosure' affordance`, async t => {
	await t.resizeWindow(800, 520)

	// panelset element should switch to a `disclosure` affordance with the given property assignment

	await t.expect(panelset.getProperty('affordance')).eql('content')

	await t.expect(panelset.setProperty('affordance', 'disclosure')).eql(true)

	await t.expect(panelset.getProperty('affordance')).eql('disclosure')

	const headings = panelset.find('h3')

	// panelset element should contain 3 elements matching the label part
	await t.expect(headings.count).eql(3)

	/** ShadowDOM label elements which the headings are slotted into. */
	const shadowLabels = headings.assignedSlot().closest('[part~="label"]')

	// panelset element should contain 3 elements matching the label part
	await t.expect(shadowLabels.count).eql(3)

	// verify qualities of each label
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(0), { isOpen: true })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(1), { isOpen: false })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(2), { isOpen: false })
})

test(`Implements programatic 'tabset' affordance`, async t => {
	await t.resizeWindow(800, 520)

	// panelset element should switch to a `tabset` affordance with the given property assignment

	await t.expect(panelset.getProperty('affordance')).eql('content')

	await t.expect(panelset.setProperty('affordance', 'tabset')).eql(true)

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
