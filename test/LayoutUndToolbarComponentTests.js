define(['src/Calendar', 'src/Layout', 'src/Header', 'src/Toolbar', 'src/Content'], (Calendar, Layout, Header, Toolbar, Content) => {
    'use strict';
    QUnit.module('LayoutUndToolbarComponent', hooks => {
        hooks.beforeEach(() => {
            this.initialView = Calendar.views.DEFAULT;
            this.rendered = Inferno.TestUtils.renderIntoDocument($el(Layout.default));
        });
        QUnit.test('Toolbarin month-näkymänavigaatiopainike vaihtaa näkymän muotoon Calendar.views.MONTH', assert => {
            const expectedNewView = Calendar.views.MONTH;
            // Assertoi alkuperäinen näkymä
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[this.initialView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[this.initialView]), undefined);
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const monthViewButton = Array.from(buttons).find(el => el.textContent === 'Kuukausi');
            monthViewButton.click();
            // Assertoi että vaihtui
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedNewView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[expectedNewView]), undefined);
        });
        QUnit.test('Toolbarin week-näkymänavigaatiopainike ei vaihda näkymää', assert => {
            assert.equal(this.initialView, Calendar.views.DEFAULT);
            // Assertoi alkuperäinen näkymä
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[this.initialView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[this.initialView]), undefined);
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const weekViewButton = Array.from(buttons).find(el => el.textContent === 'Viikko');
            weekViewButton.click();
            // Assertoi että ei vaihtunut
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[this.initialView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[this.initialView]), undefined);
        });
        QUnit.test('Toolbarin day-näkymänavigaatiopainike vaihtaa näkymän muotoon Calendar.views.DAY', assert => {
            const expectedNewView = Calendar.views.DAY;
            // Assertoi alkuperäinen näkymä
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[this.initialView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[this.initialView]), undefined);
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const dayViewButton = Array.from(buttons).find(el => el.textContent === 'Päivä');
            dayViewButton.click();
            // Assertoi että vaihtui
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedNewView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[expectedNewView]), undefined);
        });
    });
});
