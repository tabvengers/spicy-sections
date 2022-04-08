import * as $ from './testcafe'

export async function validateLabelInTabsetAffordance(t: $.TestController, label: $.Selector, opts: { isOpen: boolean }) {
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

export async function validateLabelInContentAffordance(t: $.TestController, label: $.Selector) {
	// label should have no role
	await t.expect(label.hasAttribute('role')).eql(false)

	// label should not have an `aria-expanded` attribute
	await t.expect(label.hasAttribute('aria-expanded')).eql(false)

	// label should not have an `aria-selected` attribute
	await t.expect(label.hasAttribute('aria-selected')).eql(false)

	// label should have an `open` part
	await t.expect(label.part).contains('open')
}

export async function validateLabelInDisclosureAffordance(t: $.TestController, label: $.Selector, opts: { isOpen: boolean }) {
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

export async function validatePanelObject(t: $.TestController, panel: any, details: { open?: boolean, label?: { [property: string]: any } }) {
	if (details.open) {
		await t.expect(panel.open).eql(details.open)
	}

	for (let property in details.label) {
		await t.expect(panel.label[property]).eql(details.label[property])
	}
}