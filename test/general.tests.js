import { Selector } from 'testcafe';

fixture `Spicy sections`
    .page `https://spicy-sections.glitch.me/automation-tests-1.html`;

const heading = Selector("h1");
const spicySection = Selector("spicy-sections");
const spicyHeadings = Selector("spicy-sections > h2")

const BREAKPOINTS = {
    'collapse': 570,
    'exclusive-collapse': 650,
    'tab-bar': 1100
}

// helper
async function verifyTab(t, tabLabel, selected) {
    let content = await tabLabel.nextSibling()
    let expectedDisplayEquality = !selected ? "eql" : "notEql" 

    let labelId = await tabLabel.getAttribute('id');
    let contentLabelledBy = await content.getAttribute('aria-labelledby')
    
    return t.expect(tabLabel.getAttribute('slot')).eql('tabListSlot')
        .expect(tabLabel.getAttribute('role')).eql('tab')
        .expect(tabLabel.getAttribute('aria-selected')).eql(selected.toString())
        .expect(tabLabel.getAttribute('tabindex')).eql(selected ? '0' : '-1')

        // not sure this is necessary...
        .expect(contentLabelledBy).eql(labelId)

        // just as important that it doesn't contain attributes from others
        .expect(tabLabel.hasAttribute('aria-expanded')).eql(false)

        // test the content panel
        .expect(content.getAttribute('tabindex')).eql('0')
        .expect(content.getAttribute('role')).eql('tabpanel')   
        .expect(content.getStyleProperty('display'))[expectedDisplayEquality]("none")
}


// helper
async function verifyExclusiveCollapseHeading(t, label, selected) {
    let content = await label.nextSibling()
    let expectedDisplayEquality = !selected ? "eql" : "notEql" 

    let labelId = await label.getAttribute('id');
    let contentLabelledBy = await content.getAttribute('aria-labelledby')
    
    return t.expect(label.getAttribute('role')).eql('button')
        .expect(label.getAttribute('tabindex')).eql(selected ? '0' : '-1')
        .expect(label.getAttribute('aria-expanded')).eql(selected ? 'true' : 'false')

        // not sure this is necessary...
        .expect(contentLabelledBy).eql(labelId)
  
        // just as important that it doesn't contain attributes from others
        .expect(label.hasAttribute('slot')).eql(false)
        .expect(label.hasAttribute('aria-selected')).eql(false)

        // test the content panel
        // TODO: unsure about this one, one should be true
        //.expect(content.getAttribute('tabindex')).eql("0")
        .expect(content.hasAttribute('tabindex')).eql(false)
        .expect(content.getStyleProperty('display'))[expectedDisplayEquality]("none")
}

// helper
async function verifySimpleCollapseHeading(t, label, selected) {
    let content = await label.nextSibling()
    let expectedDisplayEquality = !selected ? "eql" : "notEql" 

    let labelId = await label.getAttribute('id');
    let contentLabelledBy = await content.getAttribute('aria-labelledby')
    

    return t.expect(label.getAttribute('role')).eql('button')
        .expect(label.getAttribute('tabindex')).eql('0')
        .expect(label.getAttribute('aria-expanded')).eql(selected ? 'true' : 'false')

        // not sure this is necessary...
        .expect(contentLabelledBy).eql(labelId)
  
        // just as important that it doesn't contain attributes from others
        .expect(label.hasAttribute('slot')).eql(false)
        .expect(label.hasAttribute('aria-selected')).eql(false)

        // test the content panel
        // TODO: unsure about this one, one should be true
        //.expect(content.getAttribute('tabindex')).eql("0")
        .expect(content.hasAttribute('tabindex')).eql(false)
        .expect(content.getStyleProperty('display'))[expectedDisplayEquality]("none")
}

test('Verify simple affordance updates', async t => {
    await t
        .maximizeWindow()
        .expect(heading.innerText).contains("Days")
        .resizeWindow(BREAKPOINTS['tab-bar'], 1080)
        .expect(spicySection.getAttribute('affordance')).eql('tab-bar')
        .resizeWindow(BREAKPOINTS['exclusive-collapse'], 1080)
        .expect(spicySection.getAttribute('affordance')).eql('exclusive-collapse')
        .expect(spicySection.getAttribute('affordance')).notEql('tab-bar')
});
/**
 * This work is licensed under the W3C Software and Document License
 * (http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
 */


test('Verify tabs accessibility', async t => {
    await t
        .maximizeWindow()
        .expect(heading.innerText).contains("Days")
        .resizeWindow(BREAKPOINTS['tab-bar'], 1080)
        .expect(spicySection.getAttribute('affordance')).eql('tab-bar')
    

    await verifyTab(t, spicyHeadings.nth(0), true)
    await verifyTab(t, spicyHeadings.nth(1), false)
    await verifyTab(t, spicyHeadings.nth(2), false)
    await verifyTab(t, spicyHeadings.nth(3), false)
    await verifyTab(t, spicyHeadings.nth(4), false)
    await verifyTab(t, spicyHeadings.nth(5), false)
    await verifyTab(t, spicyHeadings.nth(6), false)

});

test('Verify exclusive-collapse accessibility', async t => {
    await t
        .maximizeWindow()
        .expect(heading.innerText).contains("Days")
        .resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
        .expect(spicySection.getAttribute('affordance')).eql('exclusive-collapse')

    await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(0), true)
    await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(1), false)
    await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(2), false)
    await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(3), false)
    await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(4), false)
    await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(5), false)
    await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(6), false)
});


test('Verify non-exclusive collapses accessibility', async t => {
    await t
        .maximizeWindow()
        .expect(heading.innerText).contains("Days")
        .resizeWindow(BREAKPOINTS['collapse'], 812)
        .expect(spicySection.getAttribute('affordance')).eql('collapse')

    await verifySimpleCollapseHeading(t, spicyHeadings.nth(0), false)
    await verifySimpleCollapseHeading(t, spicyHeadings.nth(1), false)
    await verifySimpleCollapseHeading(t, spicyHeadings.nth(2), false)
    await verifySimpleCollapseHeading(t, spicyHeadings.nth(3), false)
    await verifySimpleCollapseHeading(t, spicyHeadings.nth(4), false)
    await verifySimpleCollapseHeading(t, spicyHeadings.nth(5), false)
    await verifySimpleCollapseHeading(t, spicyHeadings.nth(6), false)
});

test('Verify affordance on page refresh', async t => {
    await t
        .resizeWindow(BREAKPOINTS['tab-bar'], 1080)
        .expect(spicySection.getAttribute('affordance')).eql('tab-bar')
        .resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
        .expect(spicySection.getAttribute('affordance')).eql('exclusive-collapse')
        
    await t.eval(() => location.reload(true));

    await t
        .wait(2000)    
        .expect(spicySection.getAttribute('affordance')).eql('exclusive-collapse');
});


test('verify tabs click', async t => {
    await t.resizeWindow(BREAKPOINTS['tab-bar'], 1080)
    let count = await spicyHeadings.count;
     for(let i = 0; i < count; i++){
        await t.click(spicyHeadings.nth(i));
        for(let ii = 0; ii < count; ii++){
            let expected = i === ii
            await verifyTab(t, spicyHeadings.nth(ii), expected);
        }
    }
});

test('verify collapse click', async t => {
    await t.resizeWindow(BREAKPOINTS['collapse'], 812)
    let count = await spicyHeadings.count;
     for(let i = 0; i < count; i++){
        await t.click(spicyHeadings.nth(i));
        for(let ii = 0; ii < count; ii++){
            // as you walk thru, prev ones should still be open
            let expected = ii <= i
            await verifySimpleCollapseHeading(t, spicyHeadings.nth(ii), expected);
        }
    }
});

test('verify exclusive collapse click', async t => {
    await t.resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
    let count = await spicyHeadings.count;
     for(let i = 0; i < count; i++){
        await t.click(spicyHeadings.nth(i));
        for(let ii = 0; ii < count; ii++){
            let expected = i === ii
            await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(ii), expected);
        }
    }
});

test('verify element focus within each tab', async t => {
    await t.resizeWindow(BREAKPOINTS['tab-bar'], 1080)
    let count = await spicyHeadings.count;
    for (let i = 0; i < count; i++) {
        await t.click(spicyHeadings.nth(i));
        let link = await Selector('a').nth(i);
        // after first tab content area is selected not the link within it
        await t.pressKey('tab').expect(link.focused).eql(false);
        await t.pressKey('tab').expect(link.focused).eql(true);
    }
});

test('verify element focus within each collapse', async t => {
    await t.resizeWindow(BREAKPOINTS['collapse'], 812)
    let count = await spicyHeadings.count;
    for (let i = 0; i < count; i++) {
        await t.click(spicyHeadings.nth(i));
        let link = await Selector('a').nth(i);
        await t.pressKey('tab').expect(link.focused).eql(true);
    }
});

test('verify element focus within each exclusive-collapse', async t => {
    await t.resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
    let count = await spicyHeadings.count;
    for (let i = 0; i < count; i++) {
        await t.click(spicyHeadings.nth(i));
        let link = await Selector('a').nth(i);
        await t.pressKey('tab').expect(link.focused).eql(true);
    }
});


test('verify tabs keyboard a11y', async t => {
    await t.resizeWindow(BREAKPOINTS['tab-bar'], 1080)
        .expect(spicySection.getAttribute('affordance')).eql('tab-bar')

    let count = await spicyHeadings.count;
    for (let i = 0; i < count; i++) {
        let link = await Selector('a').nth(i);
        if (i == 0) {
            await t.pressKey('tab');
            await t.pressKey('tab tab').expect(link.focused).eql(true);
        } else {
            await t.pressKey('shift+tab shift+tab right');
            await t.pressKey('tab tab').expect(link.focused).eql(true);
        }

        for (let ii = 0; ii < count; ii++) {
            let expected = i === ii
            await verifyTab(t, spicyHeadings.nth(ii), expected);
        }
    }
});

test('verify exclusive collapse keyboard a11y', async t => {
    await t.resizeWindow(BREAKPOINTS['exclusive-collapse'], 812)
        .expect(spicySection.getAttribute('affordance')).eql('exclusive-collapse')

    let count = await spicyHeadings.count;
    for (let i = 0; i < count; i++) {
        let link = await Selector('a').nth(i);
        if (i == 0) {
            await t.pressKey('tab');
            await t.pressKey('tab').expect(link.focused).eql(true);
        } else {
            await t.pressKey('shift+tab down');
            await t.pressKey('tab').expect(link.focused).eql(true);

        }
        for (let ii = 0; ii < count; ii++) {
            let expected = i === ii
            await verifyExclusiveCollapseHeading(t, spicyHeadings.nth(ii), expected);
        }
    }
});

test('verify collapse keyboard a11y', async t => {
    await t.resizeWindow(BREAKPOINTS['collapse'], 812)
        .expect(spicySection.getAttribute('affordance')).eql('collapse');

    let count = await spicyHeadings.count;
    for (let i = 0; i < count; i++) {
        let link = await Selector('a').nth(i);
        await t.pressKey('tab space');
        await t.pressKey('tab').expect(link.focused).eql(true);
        for (let ii = 0; ii < count; ii++) {
            let expected = ii <= i
            await verifySimpleCollapseHeading(t, spicyHeadings.nth(ii), expected);
        }
    }
});
