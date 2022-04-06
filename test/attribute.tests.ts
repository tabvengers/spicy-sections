import * as $ from './testcafe'
import * as utils from './utils'

// Constants
// -----------------------------------------------------------------------------

const PAGE_URL = 'http://localhost:3000/demonstration/plain/'

// Fixture
// -----------------------------------------------------------------------------

fixture('Panelset: The "affordance" attribute').page(PAGE_URL)

// Testing Setup
// -----------------------------------------------------------------------------

const panelset = $.document().find('oui-panelset')

// Testing
// -----------------------------------------------------------------------------

test(`Affordance is 'content', by default`, async t => {
	await t.expect(panelset.hasAttribute('affordance')).eql(false)

	// value of `affordance` DOM property is "content"
	await t.expect(panelset.getProperty('affordance')).eql('content')

	// value of `affordance` CSS property is "content"
	await t.expect(panelset.getCSSProperty('--affordance')).eql('content')
})
