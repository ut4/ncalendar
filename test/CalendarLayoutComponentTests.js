import CalendarLayout from '../src/CalendarLayout.js';
import Modal from '../src/Modal.js';
import Toolbar from '../src/Toolbar.js';
import ViewLayouts from '../src/ViewLayouts.js';
import Constants from '../src/Constants.js';

QUnit.module('CalendarLayoutComponent', function () {
    const render = viewName => {
        this.initialView = viewName || Constants.VIEW_DEFAULT;
        this.rendered = ReactTestUtils.renderIntoDocument(
            viewName ? $el(CalendarLayout, {defaultView: viewName}) : $el(CalendarLayout)
        );
    };
    QUnit.test('renderöi kalenterin Constants.VIEW_DEFAULT-muodossa', assert => {
        render();
        const expectedView = this.initialView;
        assert.notEqual(ReactTestUtils.findRenderedComponentWithType(this.rendered, Modal), undefined);
        assert.notEqual(ReactTestUtils.findRenderedComponentWithType(this.rendered, Toolbar), undefined);
        const calendarLayout = ReactTestUtils.findRenderedComponentWithType(this.rendered, CalendarLayout);
        assert.equal(calendarLayout.state.viewLayout instanceof ViewLayouts[expectedView], true);
    });
    QUnit.test('renderöi kalenterin props.defaultView-muodossa', assert => {
        const expectedInitialView = Constants.VIEW_DAY;
        render(expectedInitialView);
        assert.notEqual(ReactTestUtils.findRenderedComponentWithType(this.rendered, Modal), undefined);
        assert.notEqual(ReactTestUtils.findRenderedComponentWithType(this.rendered, Toolbar), undefined);
        const calendarLayout = ReactTestUtils.findRenderedComponentWithType(this.rendered, CalendarLayout);
        assert.equal(calendarLayout.state.viewLayout instanceof ViewLayouts[expectedInitialView], true);
    });
    QUnit.test('Asettaa modalin propertyksi', assert => {
        const calendarLayout = ReactTestUtils.findRenderedComponentWithType(this.rendered, CalendarLayout);
        assert.ok(calendarLayout.modal instanceof Modal);
    });
    QUnit.test('Toolbarin month-näkymänavigaatiopainike vaihtaa näkymän muotoon Constants.VIEW_MONTH', assert => {
        render();
        const expectedNewView = Constants.VIEW_MONTH;
        // Paina nappia
        const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(this.rendered, 'button');
        const monthViewButton = Array.from(buttons).find(el => el.textContent === 'Kuukausi');
        ReactTestUtils.Simulate.click(monthViewButton);
        // Assertoi että vaihtui
        const calendarLayout = ReactTestUtils.findRenderedComponentWithType(this.rendered, CalendarLayout);
        assert.equal(calendarLayout.state.viewLayout instanceof ViewLayouts[expectedNewView], true);
    });
    QUnit.test('Toolbarin week-näkymänavigaatiopainike ei vaihda näkymää', assert => {
        render();
        assert.equal(Constants.VIEW_DEFAULT, Constants.VIEW_WEEK);
        // Paina nappia
        const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(this.rendered, 'button');
        const weekViewButton = Array.from(buttons).find(el => el.textContent === 'Viikko');
        ReactTestUtils.Simulate.click(weekViewButton);
        // Assertoi että ei vaihtunut
        const calendarLayout = ReactTestUtils.findRenderedComponentWithType(this.rendered, CalendarLayout);
        assert.equal(calendarLayout.state.viewLayout instanceof ViewLayouts[this.initialView], true);
    });
    QUnit.test('Toolbarin day-näkymänavigaatiopainike vaihtaa näkymän muotoon Constants.VIEW_DAY', assert => {
        render();
        const expectedNewView = Constants.VIEW_DAY;
        // Assertoi alkuperäinen näkymä
        const calendarLayout = ReactTestUtils.findRenderedComponentWithType(this.rendered, CalendarLayout);
        assert.equal(calendarLayout.state.viewLayout instanceof ViewLayouts[this.initialView], true);
        // Paina nappia
        const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(this.rendered, 'button');
        const dayViewButton = Array.from(buttons).find(el => el.textContent === 'Päivä');
        ReactTestUtils.Simulate.click(dayViewButton);
        // Assertoi että vaihtui
        assert.equal(calendarLayout.state.viewLayout instanceof ViewLayouts[expectedNewView], true);
    });
});
