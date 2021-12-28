import { Selector, t } from 'testcafe';

export default class utils {
    constructor() {
    }

    async verifyTab(t, tabLabel, selected) {
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


    async verifyExclusiveCollapseHeading(t, label, selected) {
        let content = await label.nextSibling()
        let expectedDisplayEquality = !selected ? "eql" : "notEql"

        let labelId = await label.getAttribute('id');
        let contentLabelledBy = await content.getAttribute('aria-labelledby')

        return t.expect(label.getAttribute('role')).eql('button')
            .expect(label.getAttribute('tabindex')).eql(selected ? '0' : '-1')
            .expect(label.getAttribute('aria-expanded')).eql(selected ? 'true' : 'false')

            // not sure this is necessary...
            // .expect(contentLabelledBy).eql(labelId)

            // just as important that it doesn't contain attributes from others
            .expect(label.hasAttribute('slot')).eql(false)
            .expect(label.hasAttribute('aria-selected')).eql(false)

            // test the content panel
            // TODO: unsure about this one, one should be true
            //.expect(content.getAttribute('tabindex')).eql("0")
            .expect(content.hasAttribute('tabindex')).eql(false)
            .expect(content.getStyleProperty('display'))[expectedDisplayEquality]("none")
    }

    async verifySimpleCollapseHeading(t, label, selected) {
        let content = await label.nextSibling()
        let expectedDisplayEquality = !selected ? "eql" : "notEql"
        let labelId = await label.getAttribute('id');
        let contentLabelledBy = await content.getAttribute('aria-labelledby')

        return t.expect(label.getAttribute('role')).eql('button')
            .expect(label.getAttribute('tabindex')).eql('0')
            .expect(label.getAttribute('aria-expanded')).eql(selected ? 'true' : 'false')

            // not sure this is necessary...
            // .expect(contentLabelledBy).eql(labelId)

            // just as important that it doesn't contain attributes from others
            .expect(label.hasAttribute('slot')).eql(false)
            .expect(label.hasAttribute('aria-selected')).eql(false)

            // test the content panel
            // TODO: unsure about this one, one should be true
            //.expect(content.getAttribute('tabindex')).eql("0")
            .expect(content.hasAttribute('tabindex')).eql(false)
            .expect(content.getStyleProperty('display'))[expectedDisplayEquality]("none")
    }

    async refreshPage() {
        await t.eval(() => location.reload(true));
    }
}