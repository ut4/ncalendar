define(['src/Calendar', 'src/Constants', 'src/Toolbar', 'src/Header', 'src/Content'], (Calendar, Constants, Toolbar, Header, Content) => {
    'use strict';
    QUnit.module('CalendarComponent', hooks => {
        hooks.beforeEach(() => {
            this.initialView = Constants.VIEW_DEFAULT;
            this.rendered = Inferno.TestUtils.renderIntoDocument($el(Calendar.default));
        });
        QUnit.test('renderöi kalenterin Constants.VIEWS_DEFAULT-muodossa', assert => {
            const expectedView = this.initialView;
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Toolbar.default), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[expectedView]), undefined);
        });
        QUnit.test('Toolbarin month-näkymänavigaatiopainike vaihtaa näkymän muotoon Constants.VIEWS_MONTH', assert => {
            const expectedNewView = Constants.VIEW_MONTH;
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const monthViewButton = Array.from(buttons).find(el => el.textContent === 'Kuukausi');
            monthViewButton.click();
            // Assertoi että vaihtui
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedNewView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[expectedNewView]), undefined);
        });
        QUnit.test('Toolbarin week-näkymänavigaatiopainike ei vaihda näkymää', assert => {
            assert.equal(Constants.VIEW_DEFAULT, Constants.VIEW_WEEK);
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const weekViewButton = Array.from(buttons).find(el => el.textContent === 'Viikko');
            weekViewButton.click();
            // Assertoi että ei vaihtunut
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[this.initialView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Content[this.initialView]), undefined);
        });
        QUnit.test('Toolbarin day-näkymänavigaatiopainike vaihtaa näkymän muotoon Constants.VIEWS_DAY', assert => {
            const expectedNewView = Constants.VIEW_DAY;
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
