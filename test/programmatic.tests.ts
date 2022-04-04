import { Selector } from 'testcafe'
import Utils from './utils/helpers'

const utils = new Utils()
const verifyTab = utils.verifyTab
const verifySimpleCollapseHeading = utils.verifySimpleCollapseHeading
const verifyExclusiveCollapseHeading = utils.verifyExclusiveCollapseHeading

fixture`Spicy sections - programmatic tests`
	.page`https://spicy-sections.glitch.me/programatic.html`

const collapseBtn = Selector('button').withText('collapse')
const exclusiveCollapseBtn = Selector('button').withText('exclusive-collapse')
const tabBtn = Selector('button').withText('tab-bar')
const heading = Selector('h1')
const spicySection = Selector('spicy-sections')
const spicyHeadings = Selector('spicy-sections > h2')

const BREAKPOINTS = {
	'collapse': 570,
	'exclusive-collapse': 650,
	'tab-bar': 1100,
}

test('Verify simple collapse accessibility', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(collapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('collapse')

	await verifySimpleCollapseHeading(t, spicyHeadings.nth(0), false)
	await verifySimpleCollapseHeading(t, spicyHeadings.nth(1), false)
	await verifySimpleCollapseHeading(t, spicyHeadings.nth(2), false)
})

test('Verify exclusive-collapse accessibility', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(exclusiveCollapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('exclusive-collapse')

	await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(0), true)
	await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(1), false)
	await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(2), false)
})

test('Verify tabs accessibility', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(tabBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('tab-bar')

	await verifyTab(t, spicyHeadings.nth(0), true)
	await verifyTab(t, spicyHeadings.nth(1), false)
	await verifyTab(t, spicyHeadings.nth(2), false)
})

test('Verify simple collapse affordance on page refresh', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(collapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('collapse')
	await utils.refreshPage()

	await t.wait(2000).expect(spicySection.hasAttribute('affordance')).notOk()
})

test('Verify exclusive collapse affordance on page refresh', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(exclusiveCollapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('exclusive-collapse')
	await utils.refreshPage()

	await t.wait(2000).expect(spicySection.hasAttribute('affordance')).notOk()
})

test('Verify tabs affordance on page refresh', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(tabBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('tab-bar')
	await utils.refreshPage()

	await t.wait(2000).expect(spicySection.hasAttribute('affordance')).notOk()
})

test('Verify simple collapse affordance on browser resize', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(collapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('collapse')
		.resizeWindow(BREAKPOINTS['collapse'], 812)
		.expect(spicySection.getAttribute('affordance'))
		.eql('collapse')
		.resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
		.expect(spicySection.getAttribute('affordance'))
		.eql('collapse')
		.resizeWindow(BREAKPOINTS['tab-bar'], 1080)
		.expect(spicySection.getAttribute('affordance'))
		.eql('collapse')
})

test('Verify exlclusive collapse affordance on browser resize', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(exclusiveCollapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('exclusive-collapse')
		.resizeWindow(BREAKPOINTS['collapse'], 812)
		.expect(spicySection.getAttribute('affordance'))
		.eql('exclusive-collapse')
		.resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
		.expect(spicySection.getAttribute('affordance'))
		.eql('exclusive-collapse')
		.resizeWindow(BREAKPOINTS['tab-bar'], 1080)
		.expect(spicySection.getAttribute('affordance'))
		.eql('exclusive-collapse')
})

test('Verify tabs affordance on browser resize', async (t) => {
	await t
		.maximizeWindow()
		.expect(heading.innerText)
		.contains('Showing off Spicy Sections')
		.click(tabBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('tab-bar')
		.resizeWindow(BREAKPOINTS['collapse'], 812)
		.expect(spicySection.getAttribute('affordance'))
		.eql('tab-bar')
		.resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
		.expect(spicySection.getAttribute('affordance'))
		.eql('tab-bar')
		.resizeWindow(BREAKPOINTS['tab-bar'], 1080)
		.expect(spicySection.getAttribute('affordance'))
		.eql('tab-bar')
})
test('verify collapse click', async (t) => {
	await t.click(collapseBtn)
	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		await t.click(spicyHeadings.nth(i))
		for (let ii = 0; ii < count; ii++) {
			// as you walk thru, prev ones should still be open
			let expected = ii <= i
			await verifySimpleCollapseHeading(t, spicyHeadings.nth(ii), expected)
		}
	}
})

test('verify exclusive collapse click', async (t) => {
	await t.click(exclusiveCollapseBtn)
	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		await t.click(spicyHeadings.nth(i))
		for (let ii = 0; ii < count; ii++) {
			let expected = i === ii
			await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(ii), expected)
		}
	}
})

test('verify tabs click', async (t) => {
	await t.click(tabBtn)
	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		await t.click(spicyHeadings.nth(i))
		for (let ii = 0; ii < count; ii++) {
			let expected = i === ii
			await verifyTab(t, spicyHeadings.nth(ii), expected)
		}
	}
})

test('verify element focus within each collapse', async (t) => {
	await t.click(collapseBtn)
	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		await t.click(spicyHeadings.nth(i))
		let link = await Selector('a').nth(i)
		await t.pressKey('tab').expect(link.focused).eql(true)
	}
})

test('verify element focus within each exclusive-collapse', async (t) => {
	await t.click(exclusiveCollapseBtn)
	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		await t.click(spicyHeadings.nth(i))
		let link = await Selector('a').nth(i)
		await t.pressKey('tab').expect(link.focused).eql(true)
	}
})

test('verify element focus within each tab', async (t) => {
	await t.click(tabBtn)
	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		await t.click(spicyHeadings.nth(i))
		let link = await Selector('a').nth(i)
		// after first tab content area is selected not the link within it
		await t.pressKey('tab').expect(link.focused).eql(false)
		await t.pressKey('tab').expect(link.focused).eql(true)
	}
})

test('verify collapse keyboard a11y', async (t) => {
	await t
		.click(collapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('collapse')

	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		let link = await Selector('a').nth(i)
		if (i == 0) {
			await t.pressKey('tab tab tab space')
			await t.pressKey('tab').expect(link.focused).eql(true)
		} else {
			await t.pressKey('tab space')
			await t.pressKey('tab').expect(link.focused).eql(true)
		}
		for (let ii = 0; ii < count; ii++) {
			let expected = ii <= i
			await verifySimpleCollapseHeading(t, spicyHeadings.nth(ii), expected)
		}
	}
})

test('verify exclusive collapse keyboard a11y', async (t) => {
	await t
		.click(exclusiveCollapseBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('exclusive-collapse')

	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		let link = await Selector('a').nth(i)
		if (i == 0) {
			await t.pressKey('tab tab')
			await t.pressKey('tab').expect(link.focused).eql(true)
		} else {
			await t.pressKey('shift+tab down')
			await t.pressKey('tab').expect(link.focused).eql(true)
		}
		for (let ii = 0; ii < count; ii++) {
			let expected = i === ii
			await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(ii), expected)
		}
	}
})

test('verify tabs keyboard a11y', async (t) => {
	await t
		.click(tabBtn)
		.expect(spicySection.getAttribute('affordance'))
		.eql('tab-bar')

	let count = await spicyHeadings.count
	for (let i = 0; i < count; i++) {
		let link = await Selector('a').nth(i)
		if (i == 0) {
			await t.pressKey('tab')
			await t.pressKey('tab tab').expect(link.focused).eql(true)
		} else {
			await t.pressKey('shift+tab shift+tab right')
			await t.pressKey('tab tab').expect(link.focused).eql(true)
		}

		for (let ii = 0; ii < count; ii++) {
			let expected = i === ii
			await verifyTab(t, spicyHeadings.nth(ii), expected)
		}
	}
})
