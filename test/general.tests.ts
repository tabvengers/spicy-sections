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
	
	// panelset element should switch to a `disclosure` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('disclosure')

	/** Label elements contained by the Panelset element. */
	const labels = panelset.findByPart('label')
	
	// panelset element should contain 3 elements matching the label part
	await t.expect(labels.count).eql(3)

	// verify qualities of each label
	async function verifyDisclosureLabel(label: typeof labels, opts: { isOpen: boolean }) {
		// label should have a `button` role
		await t.expect(label.role).eql('button')

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

	await verifyDisclosureLabel(labels.at(0), { isOpen: true })
	await verifyDisclosureLabel(labels.at(1), { isOpen: false })
	await verifyDisclosureLabel(labels.at(2), { isOpen: false })
})

test(`Supports 'content' affordance when window is ${BREAKPOINTS.content.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.content)
	
	// panelset element should switch to a `content` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('content')

	/** Label elements contained by the Panelset element. */
	const labels = panelset.findByPart('label')
	
	// panelset element should contain 3 elements matching the label part
	await t.expect(labels.count).eql(3)

	// verify qualities of each label
	async function verifyContentLabel(label: typeof labels) {
		// label should have no role / the generic role
		await t.expect(label.role).eql('generic')

		// label should not have an `aria-expanded` attribute
		await t.expect(label.hasAttribute('aria-expanded')).eql(false)

		// label should not have an `aria-selected` attribute
		await t.expect(label.hasAttribute('aria-selected')).eql(false)

		// label should have an `open` part
		await t.expect(label.part).contains('open')
	}

	await verifyContentLabel(labels.at(0))
	await verifyContentLabel(labels.at(1))
	await verifyContentLabel(labels.at(2))
})

test(`Supports 'tabset' affordance when window is ${BREAKPOINTS.tabset.join('x')} wide`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)
	
	// panelset element should switch to a `tabset` affordance at the given breakpoint
	await t.expect(panelset.getProperty('affordance')).eql('tabset')

	/** Label elements contained by the Panelset element. */
	const labels = panelset.findByPart('label')
	
	// panelset element should contain 3 elements matching the label part
	await t.expect(labels.count).eql(3)

	// verify qualities of each label
	async function verifyTabsetLabel(label: typeof labels, opts: { isOpen: boolean }) {
		// label should have a `tab` role
		await t.expect(label.role).eql('tab')

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

	await verifyTabsetLabel(labels.at(0), { isOpen: true })
	await verifyTabsetLabel(labels.at(1), { isOpen: false })
	await verifyTabsetLabel(labels.at(2), { isOpen: false })
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
	const h3 = openLabel.slotted('h3')

	await t.expect(h3.count).eql(1)
	await t.expect(h3.tagName).eql('h3')
	await t.expect(h3.textContent).eql('Tabset')
})

test(`Verify a "tab"`, async t => {
	await t.resizeWindow(...BREAKPOINTS.tabset)

	const openLabel = panelset.findByPart('label is-tabset open')

	await t.expect(openLabel.count).eql(1)

	await t.expect(openLabel.slotted().textContent).eql('Tabset')

	await t.expect(openLabel.getAttribute('aria-controls')).eql('content-0')
	await t.expect(openLabel.getAttribute('aria-selected')).eql('true')
	await t.expect(openLabel.getAttribute('id')).eql('label-0')
	await t.expect(openLabel.getAttribute('part')).eql('label is-tabset open')
	await t.expect(openLabel.getAttribute('role')).eql('tab')
	await t.expect(openLabel.getAttribute('tabindex')).eql('0')
})
