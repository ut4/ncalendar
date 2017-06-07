define(['src/Calendar', 'src/Constants', 'src/DateUtils',], (Calendar, Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    QUnit.module('Calendar.dateCursorFactory', () => {
        QUnit.test('.newDateCursor(\'day\') palauttaa kursorin jonka range = DayViewCursorRange', assert => {
            const dateCursor = Calendar.dateCursorFactory.newDateCursor(Constants.VIEW_DAY);
            const dateNow = new Date();
            assert.deepEqual(dateCursor.range.start, dateNow);
            assert.deepEqual(dateCursor.range.end, dateNow);
        });
        QUnit.test('.newDateCursor(\'week\') palauttaa kursorin jonka range = WeekViewCursorRange', assert => {
            const dateCursor = Calendar.dateCursorFactory.newDateCursor(Constants.VIEW_WEEK);
            const expectedRangeStart = dateUtils.getStartOfWeek(new Date());
            assert.deepEqual(dateCursor.range.start, expectedRangeStart);
            const expectedRangeEnd = new Date(expectedRangeStart);
            expectedRangeEnd.setDate(expectedRangeEnd.getDate() + 6);
            assert.deepEqual(dateCursor.range.end, expectedRangeEnd);
        });
        QUnit.test('.newDateCursor(\'month\') palauttaa kursorin jonka range = MonthViewCursorRange', assert => {
            const dateCursor = Calendar.dateCursorFactory.newDateCursor(Constants.VIEW_MONTH);
            const expectedRangeStart = new Date();
            expectedRangeStart.setDate(1);
            assert.deepEqual(dateCursor.range.start, expectedRangeStart);
            const expectedRangeEnd = new Date(expectedRangeStart);
            // https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
            expectedRangeEnd.setMonth(expectedRangeEnd.getMonth() + 1);
            expectedRangeEnd.setDate(0);
            assert.deepEqual(dateCursor.range.end, expectedRangeEnd);
        });
    });
});
