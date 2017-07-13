define(['src/CalendarLayout', 'test/resources/Utils', 'src/ioc', 'src/Constants'], (CalendarLayout, Utils, ioc, Constants) => {
    'use strict';
    const rtu = ReactTestUtils;
    const dateUtils = ioc.default.dateUtils();
    QUnit.module('DateCursorState', () => {
        const render = viewName => {
            this.rendered = ReactTestUtils.renderIntoDocument(
                $el(CalendarLayout.default, {settings: {defaultView: viewName}})
            );
            this.calendarController = rtu.findRenderedComponentWithType(this.rendered, CalendarLayout.default).controller;
        };
        QUnit.test('week-näkymästä day-näkymään vaihdettaessa day-näkymä adaptoi week-näkymän range.start:n', assert => {
            // Renderöi ensin week-näkymä
            render(Constants.VIEW_WEEK);
            // Navigoi pois initial-viikosta
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, '>'));
            const weekViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
            // Vaihda day-näkymään & assertoi, että adaptoi week-näkymän rangen eikä new Date()'d
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, 'Päivä'));
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
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, '>'));
            const monthViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
            // Vaihda day-näkymään & assertoi, että adaptoi month-näkymän rangen eikä new Date()'d
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, 'Päivä'));
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
            // Siirry yksi päivä initial-päivästä
            const initialRangeStart = this.calendarController.dateCursor.range.start.getDate();
            const safeDirection = getSafeDirectionForDayViewWhichDoesntChangeWeek(this.calendarController.dateCursor.range.start);
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, safeDirection));
            const savedRangeStart = this.calendarController.dateCursor.range.start.getDate();
            assert.notEqual(savedRangeStart, initialRangeStart);// sanity check
            // Siirry viikkonäkymään ...
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, 'Viikko'));
            assert.equal(this.calendarController.dateCursor.range.constructor.name, 'WeekViewCursorRange');// sanity check
            const weekViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
            // , ja takaisin päivänäkymään
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, 'Päivä'));
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
        QUnit.test('month-näkymästä week-näkymään vaihdettaessa week-näkymä adaptoi month-näkymän range.start:n', assert => {
            // Renderöi ensin month-näkymä
            render(Constants.VIEW_MONTH);
            // Navigoi pois initial-kuukaudesta
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, '>'));
            const monthViewsStartDate = new Date(this.calendarController.dateCursor.range.start);
            // Vaihda week-näkymään & assertoi, että adaptoi month-näkymän rangen eikä new Date()'d
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, 'Viikko'));
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
            // Siirry yksi viikko initial-viikosta
            const initialRangeStart = this.calendarController.dateCursor.range.start.getDate();
            const safeDirection = getSafeDirectionForWeekViewWhichDoesntChangeMonth(this.calendarController.dateCursor.range);
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, safeDirection));
            const savedRangeStart = this.calendarController.dateCursor.range.start.getDate();
            assert.notEqual(savedRangeStart, initialRangeStart);
            // Siirry kuukausinäkymään ...
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, 'Kuukausi'));
            assert.equal(this.calendarController.dateCursor.range.constructor.name, 'MonthViewCursorRange');
            const monthViewsStartDate = this.calendarController.dateCursor.range.start.getDate();
            // , ja takaisin viikkonäkymään
            rtu.Simulate.click(Utils.domUtils.findButtonByContent(this.rendered, 'Viikko'));
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
        function getSafeDirectionForDayViewWhichDoesntChangeWeek(dayViewRangeStart) {
            return dayViewRangeStart.getDay() > 2 ? '<' : '>';
        }
        function getSafeDirectionForWeekViewWhichDoesntChangeMonth(weekViewRange) {
            return weekViewRange.end.getDate() > 14 ? '<' : '>';
        }
    });
});
