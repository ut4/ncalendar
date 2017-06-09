define(['src/DateCursors', 'src/Constants'], (DateCursors, Constants) => {
    'use strict';
    QUnit.module('DateCursors.dateCursorFactory', () => {
        QUnit.test('.newDateCursor(\'day\') palauttaa kursorin jonka range = DayViewCursorRange', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newDateCursor(Constants.VIEW_DAY);
            assert.equal(dateCursor.range.constructor.name, 'DayViewCursorRange');
        });
        QUnit.test('.newDateCursor(\'week\') palauttaa kursorin jonka range = WeekViewCursorRange', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newDateCursor(Constants.VIEW_WEEK);
            assert.equal(dateCursor.range.constructor.name, 'WeekViewCursorRange');
        });
        QUnit.test('.newDateCursor(\'month\') palauttaa kursorin jonka range = MonthViewCursorRange', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newDateCursor(Constants.VIEW_MONTH);
            assert.equal(dateCursor.range.constructor.name, 'MonthViewCursorRange');
        });
    });
});
