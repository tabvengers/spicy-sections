import * as $ from './testcafe'
import * as utils from './utils'

// Constants
// -----------------------------------------------------------------------------

const defaultPageURL = 'http://localhost:3000/demonstration/default/'
const disclosurePageURL = 'http://localhost:3000/demonstration/disclosure/'

const panelset = $.document().find('oui-panelset')
const shadowLabels = panelset.findByShadowPart('label')

// Testing: Panelset Programatic Affordances (with no "affordance" attribute)
// -----------------------------------------------------------------------------

fixture('Panelset Programatic Affordances (with no "affordance" attribute)').page(defaultPageURL)

test(`By default, the affordance is set to "content"`, async t => {
	// attribute of `affordance` is non-existant
	await t.expect(panelset.hasAttribute('affordance')).eql(false)

	// value of `affordance` DOM property is "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property is "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')

	// verify qualities of each shadow label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))
})

test(`Using the "affordance" DOM property, the affordance can be set to "disclosure"`, async t => {
	// attribute of `affordance` is non-existant
	await t.expect(panelset.hasAttribute('affordance')).eql(false)

	// value of `affordance` DOM property is "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property is "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')

	// value of `affordance` DOM property is set to "disclosure"
	await t.expect(panelset.setProperty('affordance', 'disclosure')).eql(true)

	// attribute of `affordance` remains non-existant
	await t.expect(panelset.hasAttribute('affordance')).eql(false)

	// value of `affordance` DOM property is set to "disclosure"
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')

	// value of `affordance` CSS property is set "disclosure"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('disclosure')

	// verify qualities of each shadow label
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(0), { isOpen: true })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(1), { isOpen: false })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(2), { isOpen: false })
})

test(`Using the "affordance" DOM property, the affordance can be set back to "content"`, async t => {
	// value of `affordance` DOM property is set to "content"
	await t.expect(panelset.setProperty('affordance', 'content')).eql(true)

	// attribute of `affordance` remains non-existant
	await t.expect(panelset.hasAttribute('affordance')).eql(false)

	// value of `affordance` DOM property is set to "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property is set "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')

	// verify qualities of each shadow label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))
})

test(`Using the "affordance" CSS property, the affordance can be set to "disclosure"`, async t => {
	// value of `affordance` DOM property is set to "disclosure"
	await t.expect(panelset.setCSSProperty('--affordance', 'disclosure')).eql(true)

	// attribute of `affordance` remains non-existant
	await t.expect(panelset.hasAttribute('affordance')).eql(false)

	// value of `affordance` DOM property is set to "disclosure"
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')

	// value of `affordance` CSS property is set "disclosure"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('disclosure')

	// verify qualities of each shadow label
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(0), { isOpen: true })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(1), { isOpen: false })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(2), { isOpen: false })
})

test(`Using the "affordance" DOM property, the affordance can be set back to "content"`, async t => {
	// value of `affordance` CSS property is set to "content"
	await t.expect(panelset.setCSSProperty('--affordance', 'content')).eql(true)

	// attribute of `affordance` remains non-existant
	await t.expect(panelset.hasAttribute('affordance')).eql(false)

	// value of `affordance` DOM property is set to "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property is set "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')

	// verify qualities of each shadow label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))
})

test(`Using the "affordance" attribute will not change the affordance`, async t => {
	// attribute of `affordance` is non-existant
	await t.expect(panelset.setAttribute('affordance', 'disclosure')).eql(true)

	// value of `affordance` DOM property remains "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property remains "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')

	// verify qualities of each shadow label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))
})

// Testing: Panelset Programatic Affordances (with affordance="disclosure")
// -----------------------------------------------------------------------------

fixture('Panelset Programatic Affordances (with affordance="disclosure")').page(disclosurePageURL)

test(`When defined in HTML, the affordance can be set to "disclosure"`, async t => {
	// attribute of `affordance` is "disclosure"
	await t.expect(panelset.getAttribute('affordance')).eql('disclosure')

	// value of `affordance` DOM property is "disclosure"
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')

	// value of `affordance` CSS property is "disclosure"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('disclosure')

	// verify qualities of each shadow label
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(0), { isOpen: true })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(1), { isOpen: false })
	await utils.validateLabelInDisclosureAffordance(t, shadowLabels.at(2), { isOpen: false })
})

test(`Using the "affordance" DOM property, the affordance can be set to "tabset"`, async t => {
	// value of `affordance` DOM property is set to "tabset"
	await t.expect(panelset.setProperty('affordance', 'tabset')).eql(true)

	// attribute of `affordance` remains "disclosure"
	await t.expect(panelset.getAttribute('affordance')).eql('disclosure')

	// value of `affordance` DOM property is set to "tabset"
	await t.expect(panelset.getProperty('affordance')).eql('tabset')

	// value of `affordance` CSS property is set "tabset"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('tabset')

	// verify qualities of each shadow label
	await utils.validateLabelInTabsetAffordance(t, shadowLabels.at(0), { isOpen: true })
	await utils.validateLabelInTabsetAffordance(t, shadowLabels.at(1), { isOpen: false })
	await utils.validateLabelInTabsetAffordance(t, shadowLabels.at(2), { isOpen: false })
})

test(`Using the "affordance" DOM property, the affordance can be set to "content"`, async t => {
	// value of `affordance` DOM property is set to "content"
	await t.expect(panelset.setProperty('affordance', 'content')).eql(true)

	// attribute of `affordance` remains "disclosure"
	await t.expect(panelset.getAttribute('affordance')).eql('disclosure')

	// value of `affordance` DOM property is set to "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property is set "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')

	// verify qualities of each shadow label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))
})

test(`Using the "affordance" DOM property, the affordance can be set to "content"`, async t => {
	// value of `affordance` DOM property is set to "content"
	await t.expect(panelset.setProperty('affordance', 'content')).eql(true)

	// attribute of `affordance` remains "disclosure"
	await t.expect(panelset.getAttribute('affordance')).eql('disclosure')

	// value of `affordance` DOM property is set to "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property is set "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')

	// verify qualities of each shadow label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))
})

// Testing: Panelset Programatic Affordances (using "getPanels()")
// -----------------------------------------------------------------------------

fixture('Panelset Programatic Affordances (using "getPanels()")').page(defaultPageURL)

test(`By default, the affordance is set to "content"`, async t => {
	// verify qualities of each shadow label
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(0))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(1))
	await utils.validateLabelInContentAffordance(t, shadowLabels.at(2))

	const panels = await panelset.invokeProperty('getPanels')

	await t.expect(panels.length).eql(3)

	await utils.validatePanelObject(t, panels[0], {
		open: true,
		label: { localName: 'h3', textContent: 'Tabset' },
	})

	await utils.validatePanelObject(t, panels[1], {
		open: true,
		label: { localName: 'h3', textContent: 'Disclosure' },
	})

	await utils.validatePanelObject(t, panels[2], {
		open: true,
		label: { localName: 'h3', textContent: 'Content' },
	})
})
