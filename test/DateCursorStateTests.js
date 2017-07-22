import CalendarLayout from '../src/CalendarLayout.js';
import {dateCursorFactory} from '../src/DateCursors.js';
import {domUtils} from './resources/Utils.js';
import ioc from '../src/ioc.js';
import Constants from '../src/Constants.js';

const rtu = ReactTestUtils;
const dateUtils = ioc.dateUtils();

QUnit.module('DateCursorState', function (hooks) {
    hooks.beforeEach(() => {
        // Resetoi ranget
        dateCursorFactory.newCursor(Constants.VIEW_DAY).range.constructor.lastRange = null;
        dateCursorFactory.newCursor(Constants.VIEW_WEEK).range.constructor.lastRange = null;
        dateCursorFactory.newCursor(Constants.VIEW_MONTH).range.constructor.lastRange = null;
    });
    const render = viewName => {
        const settings = {defaultView: viewName};
        if (viewName === Constants.VIEW_DAY) {
            settings.defaultDate = dateUtils.getStartOfWeek(new Date());
        } else if (viewName === Constants.VIEW_WEEK) {
            settings.defaultDate = new Date();
            settings.defaultDate.setDate(9);
        }
        this.rendered = ReactTestUtils.renderIntoDocument(
            $el(CalendarLayout, {settings})
        );
        this.calendarController = rtu.findRenderedComponentWithType(this.rendered, CalendarLayout).controller;
    };
    QUnit.test('week-näkymästä day-näkymään vaihdettaessa day-näkymä adaptoi week-näkymän range.start:n', assert => {
        // Renderöi ensin week-näkymä
        render(Constants.VIEW_WEEK);
        // Navigoi pois initial-viikosta
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, '>'));
        const weekViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
        // Vaihda day-näkymään & assertoi, että adaptoi week-näkymän rangen eikä new Date()'d
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Päivä'));
        assert.equal(this.calendarController.dateCursor.range.constructor.name, 'DayViewCursorRange');// sanity check
        const dayViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
        assert.equal(
            dayViewsStartDate,
            weekViewsStartDate,
            'Pitäisi adaptoida edellisen week-näkymän range.start'
        );
    });
    QUnit.test('month-näkymästä day-näkymään vaihdettaessa day-näkymä adaptoi month-näkymän range.start:n', assert => {
        // Renderöi ensin month-näkymä
        render(Constants.VIEW_MONTH);
        // Navigoi pois initial-kuukaudesta
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, '>'));
        const monthViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
        // Vaihda day-näkymään & assertoi, että adaptoi month-näkymän rangen eikä new Date()'d
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Päivä'));
        assert.equal(this.calendarController.dateCursor.range.constructor.name, 'DayViewCursorRange');// sanity check
        const dayViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
        assert.equal(
            dayViewsStartDate,
            monthViewsStartDate,
            'Pitäisi adaptoida edellisen month-näkymän range.start'
        );
    });
    QUnit.test('week-näkymästä day-näkymään vaihdettaessa day-näkymä adaptoi aiemmin tallennetun rangen', assert => {
        render(Constants.VIEW_DAY);
        // Siirry yksi päivä initial-päivästä eteenpäin
        const initialRangeStart = this.calendarController.dateCursor.range.start.getDate();
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, '>'));
        const savedRangeStart = this.calendarController.dateCursor.range.start.getDate();
        assert.notEqual(savedRangeStart, initialRangeStart);// sanity check
        // Siirry viikkonäkymään ...
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Viikko'));
        assert.equal(this.calendarController.dateCursor.range.constructor.name, 'WeekViewCursorRange');// sanity check
        const weekViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
        // , ja takaisin päivänäkymään
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Päivä'));
        const rangeStartAfter = this.calendarController.dateCursor.range.start.getDate();
        // Assertoi, että adaptoi ensimmäisellä kerralla tallennetun staten, eikä
        // viikkonäkymän range.start:ia
        assert.equal(
            rangeStartAfter,
            savedRangeStart,
            'Pitäisi adaptoida edellisellä kerralla tallennettu range.start'
        );
        assert.notEqual(
            rangeStartAfter,
            weekViewsStartDate,
            'Ei pitäisi adaptoida week-viewin range.start'
        );
    });
    QUnit.test('Tänään-painike triggeröi lastRange-tallennuksen', assert => {
        render(Constants.VIEW_DAY);
        // Triggeröi ensimmäinen range-tallennus
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, '>'));
        const savedRangeStart = this.calendarController.dateCursor.range.start.getDate();
        // Siirry takaisin nykypäivään
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Tänään'));
        const rangeStartToday = this.calendarController.dateCursor.range.start.getDate();
        assert.notEqual(rangeStartToday, savedRangeStart);// sanity check
        // Triggeröi lastRange-adaptointi siirtymällä viikkonäkymään, ja sitten takaisin ...
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Viikko'));
        assert.equal(this.calendarController.dateCursor.range.constructor.name, 'WeekViewCursorRange');// sanity check
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Päivä'));
        // Assertoi että adaptoi tänään-daten eikä ensimmäistä tallennusta
        assert.equal(
            this.calendarController.dateCursor.range.start.getDate(),
            rangeStartToday,
            'Pitäisi adaptoida viimeisin tallennettu range (tänään-date) range.start:in arvoksi'
        );
    });
    QUnit.test('month-näkymästä week-näkymään vaihdettaessa week-näkymä adaptoi month-näkymän range.start:n', assert => {
        // Renderöi ensin month-näkymä
        render(Constants.VIEW_MONTH);
        // Navigoi pois initial-kuukaudesta
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, '>'));
        const monthViewsStartDate = new Date(this.calendarController.dateCursor.range.start);
        // Vaihda week-näkymään & assertoi, että adaptoi month-näkymän rangen eikä new Date()'d
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Viikko'));
        assert.equal(this.calendarController.dateCursor.range.constructor.name, 'WeekViewCursorRange');
        const weekViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
        assert.equal(
            weekViewsStartDate,
            dateUtils.getStartOfWeek(monthViewsStartDate).getDate(),
            'Pitäisi adaptoida edellisen month-näkymän range.start'
        );
    });
    QUnit.test('month-näkymästä week-näkymään vaihdettaessa week-näkymä adaptoi aiemmin tallennetun rangen', assert => {
        render(Constants.VIEW_WEEK);
        // Siirry yksi viikko initial-viikosta eteenpäin
        const initialRangeStart = this.calendarController.dateCursor.range.start.getDate();
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, '>'));
        const savedRangeStart = this.calendarController.dateCursor.range.start.getDate();
        assert.notEqual(savedRangeStart, initialRangeStart);
        // Siirry kuukausinäkymään ...
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Kuukausi'));
        assert.equal(this.calendarController.dateCursor.range.constructor.name, 'MonthViewCursorRange');
        const monthViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
        // , ja takaisin viikkonäkymään
        rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Viikko'));
        const rangeStartAfter = this.calendarController.dateCursor.range.start.getDate();
        // Assertoi, että adaptoi ensimmäisellä kerralla tallennetun staten, eikä
        // kuukausinäkymän range.start:ia
        assert.equal(
            rangeStartAfter,
            savedRangeStart,
            'Pitäisi adaptoida edellisellä kerralla tallennettu range.start'
        );
        assert.notEqual(
            rangeStartAfter,
            monthViewsStartDate,
            'Ei pitäisi adaptoida kuukausi-viewin range.start'
        );
    });
});
