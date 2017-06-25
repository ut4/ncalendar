define(['src/CalendarLayout', 'src/Constants', 'src/Toolbar', 'src/Header', 'src/ViewLayouts'], (CalendarLayout, Constants, Toolbar, Header, ViewLayouts) => {
    'use strict';
    QUnit.module('CalendarLayoutComponent', () => {
        const render = viewName => {
            this.initialView = viewName || Constants.VIEW_DEFAULT;
            this.rendered = Inferno.TestUtils.renderIntoDocument(
                viewName ? $el(CalendarLayout.default, {settings: {defaultView: viewName}}) : $el(CalendarLayout.default)
            );
        };
        QUnit.test('renderöi kalenterin Constants.VIEW_DEFAULT-muodossa', assert => {
            render();
            const expectedView = this.initialView;
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Toolbar.default), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedView]), undefined);
            const layout = Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, CalendarLayout.default);
            assert.equal(layout.children.state.viewLayout instanceof ViewLayouts[expectedView], true);
        });
        QUnit.test('renderöi kalenterin props.settings.defaultView-muodossa', assert => {
            const expectedInitialView = Constants.VIEW_DAY;
            render(expectedInitialView);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Toolbar.default), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedInitialView]), undefined);
            const layout = Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, CalendarLayout.default);
            assert.equal(layout.children.state.viewLayout instanceof ViewLayouts[expectedInitialView], true);
        });
        QUnit.test('Toolbarin month-näkymänavigaatiopainike vaihtaa näkymän muotoon Constants.VIEW_MONTH', assert => {
            render();
            const expectedNewView = Constants.VIEW_MONTH;
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const monthViewButton = Array.from(buttons).find(el => el.textContent === 'Kuukausi');
            monthViewButton.click();
            // Assertoi että vaihtui
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedNewView]), undefined);
            const layout = Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, CalendarLayout.default);
            assert.equal(layout.children.state.viewLayout instanceof ViewLayouts[expectedNewView], true);
        });
        QUnit.test('Toolbarin week-näkymänavigaatiopainike ei vaihda näkymää', assert => {
            render();
            assert.equal(Constants.VIEW_DEFAULT, Constants.VIEW_WEEK);
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const weekViewButton = Array.from(buttons).find(el => el.textContent === 'Viikko');
            weekViewButton.click();
            // Assertoi että ei vaihtunut
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[this.initialView]), undefined);
            const layout = Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, CalendarLayout.default);
            assert.equal(layout.children.state.viewLayout instanceof ViewLayouts[this.initialView], true);
        });
        QUnit.test('Toolbarin day-näkymänavigaatiopainike vaihtaa näkymän muotoon Constants.VIEW_DAY', assert => {
            render();
            const expectedNewView = Constants.VIEW_DAY;
            // Assertoi alkuperäinen näkymä
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[this.initialView]), undefined);
            const layout = Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, CalendarLayout.default);
            assert.equal(layout.children.state.viewLayout instanceof ViewLayouts[this.initialView], true);
            // Paina nappia
            const buttons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(this.rendered, 'button');
            const dayViewButton = Array.from(buttons).find(el => el.textContent === 'Päivä');
            dayViewButton.click();
            // Assertoi että vaihtui
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(this.rendered, Header[expectedNewView]), undefined);
            assert.equal(layout.children.state.viewLayout instanceof ViewLayouts[expectedNewView], true);
        });
    });
});
