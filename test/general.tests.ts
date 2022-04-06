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

fixture('Panelset').page(PAGE_URL)

// Testing Setup
// -----------------------------------------------------------------------------

const panelset = $.document().find('oui-panelset')

const validateLabelInTabsetAffordance = async (t: $.TestController, label: $.SelectorAPI, opts: { isOpen: boolean }) => {
	// label should have a `tab` role
	await t.expect(label.getAttribute('role')).eql('tab')

	// label should not have an `aria-expanded` attribute
	await t.expect(label.hasAttribute('aria-expanded')).eql(false)

	if (opts.isOpen) {
		// opened label should have an `open` part
		await t.expect(label.part).contains('open')

		// opened label should have an `aria-selected` value of `true`
		await t.expect(label.getAttribute('aria-selected')).eql('true')
	} else {
		// closed label should not have an `open` part
		await t.expect(label.part).notContains('open')

		// closed label should have an `aria-selected` value of `false`
		await t.expect(label.getAttribute('aria-selected')).eql('false')
	}
}

const validateLabelInContentAffordance = async (t: $.TestController, label: $.SelectorAPI) => {
	// label should have no role
	await t.expect(label.hasAttribute('role')).eql(false)

	// label should not have an `aria-expanded` attribute
	await t.expect(label.hasAttribute('aria-expanded')).eql(false)

	// label should not have an `aria-selected` attribute
	await t.expect(label.hasAttribute('aria-selected')).eql(false)

	// label should have an `open` part
	await t.expect(label.part).contains('open')
}

const validateLabelInDisclosureAffordance = async (t: $.TestController, label: $.SelectorAPI, opts: { isOpen: boolean }) => {
	// label should have a `button` role
	await t.expect(label.getAttribute('role')).eql('button')

	// label should not have an `aria-selected` attribute
	await t.expect(label.hasAttribute('aria-selected')).eql(false)

	if (opts.isOpen) {
		// opened label should have an `open` part
		await t.expect(label.part).contains('open')

		// opened label should have an `aria-expanded` value of `true`
		await t.expect(label.getAttribute('aria-expanded')).eql('true')
	} else {
		// closed label should not have an `open` part
		await t.expect(label.part).notContains('open')

		// closed label should have an `aria-expanded` value of `false`
		await t.expect(label.getAttribute('aria-expanded')).eql('false')
	}
}

// Testing
// -----------------------------------------------------------------------------

test(`Supports 'disclosure' affordance when window is ${BREAKPOINTS.disclosure.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.disclosure)

	// panelset element should switch to a `disclosure` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')

	const headings = panelset.find('h3')

	// panelset element should contain 3 elements matching the label part
	await t.expect(headings.count).eql(3)

	/** ShadowDOM label elements which the headings are slotted into. */
	const shadowLabels = headings.assignedSlot().closest('[part~="label"]')

	// panelset element should contain 3 elements matching the label part
	await t.expect(shadowLabels.count).eql(3)

	// verify qualities of each label
	await validateLabelInDisclosureAffordance(t, shadowLabels.at(0), { isOpen: true })
	await validateLabelInDisclosureAffordance(t, shadowLabels.at(1), { isOpen: false })
	await validateLabelInDisclosureAffordance(t, shadowLabels.at(2), { isOpen: false })
})

test(`Supports 'content' affordance when window is ${BREAKPOINTS.content.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.content)

	// panelset element should switch to a `content` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('content')

	/** Label elements contained by the Panelset element. */
	const shadowLabels = panelset.findByShadowPart('label')

	// panelset element should contain 3 elements matching the label part
	await t.expect(shadowLabels.count).eql(3)

	// verify qualities of each label
	await validateLabelInContentAffordance(t, shadowLabels.at(0))
	await validateLabelInContentAffordance(t, shadowLabels.at(1))
	await validateLabelInContentAffordance(t, shadowLabels.at(2))
})

test(`Supports 'tabset' affordance when window is ${BREAKPOINTS.tabset.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	// panelset element should switch to a `tabset` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('tabset')

	/** Label elements contained by the Panelset element. */
	const shadowLabels = panelset.findByShadowPart('label')

	// panelset element should contain 3 elements matching the label part
	await t.expect(shadowLabels.count).eql(3)

	// verify qualities of each label
	await validateLabelInTabsetAffordance(t, shadowLabels.at(0), { isOpen: true })
	await validateLabelInTabsetAffordance(t, shadowLabels.at(1), { isOpen: false })
	await validateLabelInTabsetAffordance(t, shadowLabels.at(2), { isOpen: false })
})

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

test(`Verify a "tab"`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	const openLabel = panelset.findByShadowPart('label is-tabset open')

	await t.expect(openLabel.count).eql(1)

	await t.expect(openLabel.slotted().textContent).eql('Tabset')

	await t.expect(openLabel.getAttribute('aria-controls')).eql('content-0')
	await t.expect(openLabel.getAttribute('aria-selected')).eql('true')
	await t.expect(openLabel.getAttribute('id')).eql('label-0')
	await t.expect(openLabel.getAttribute('part')).eql('label is-tabset open')
	await t.expect(openLabel.getAttribute('role')).eql('tab')
	await t.expect(openLabel.getAttribute('tabindex')).eql('0')
})
