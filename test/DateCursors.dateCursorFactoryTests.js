import {dateCursorFactory} from '../src/DateCursors.js';
import Constants from '../src/Constants.js';

QUnit.module('dateCursorFactory', function() {
    QUnit.test('.newCursor(\'day\') palauttaa kursorin jonka range = DayViewCursorRange', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_DAY);
        assert.equal(dateCursor.range.constructor.name, 'DayViewCursorRange');
    });
    QUnit.test('.newCursor(\'week\') palauttaa kursorin jonka range = WeekViewCursorRange', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_WEEK);
        assert.equal(dateCursor.range.constructor.name, 'WeekViewCursorRange');
    });
    QUnit.test('.newCursor(\'month\') palauttaa kursorin jonka range = MonthViewCursorRange', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_MONTH);
        assert.equal(dateCursor.range.constructor.name, 'MonthViewCursorRange');
    });
});
