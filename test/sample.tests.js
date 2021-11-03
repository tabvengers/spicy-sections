import { Selector } from 'testcafe';

fixture `Spicy sections`
    .page `https://spicy-sections.glitch.me/automation-tests-1.html`;

const heading = Selector("h1");
const spicySection = Selector("spicy-sections");
const spicyHeadings = Selector("spicy-sections > h2")

const BREAKPOINTS = {
    'collapse': 570,
    'exclusive-collapse': 650,
    'tab-bar': 1000
}

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
