import { Selector } from 'testcafe';

fixture `Spicy sections`
    .page `https://believed-festive-polka.glitch.me/`;

const heading = Selector("h1");
const spicySection = Selector("spicy-sections");

test('Verify affordance updates', async t => {
    await t
        .maximizeWindow()
        .expect(heading.innerText).contains("Days")
        .resizeWindow(810, 1080)
        .takeScreenshot({
            path:     'tablet/tabs-view.png',
            fullPage: true
        })
        .expect(spicySection.getAttribute('affordance')).eql('tab-bar')
        .expect(spicySection.getAttribute('affordance')).notEql('exclusive-collapse')
        .resizeWindow(375, 812)
        .takeScreenshot({
            path:     'mobile/exclusive-collapse-view.png',
            fullPage: true
        })
        .expect(spicySection.getAttribute('affordance')).eql('exclusive-collapse')
        .expect(spicySection.getAttribute('affordance')).notEql('tab-bar')
});
