import * as DC from '../src/DateCursors.js';
import Constants from '../src/Constants.js';
import {dateUtils} from './resources/Utils.js';

QUnit.module('DateCursorFactory', function(hooks) {
    hooks.beforeEach(() => {
        this.dateCursorFactory = new DC.DateCursorFactory(dateUtils);
    });
    QUnit.test('.newCursor(\'day\') palauttaa kursorin jonka range = DayViewCursorRange', assert => {
        const dateCursor = this.dateCursorFactory.newCursor(Constants.VIEW_DAY);
        assert.ok(dateCursor.range instanceof DC.DayViewCursorRange, 'Pitäisi luoda DayViewCursorRange:n');
    });
    QUnit.test('.newCursor(\'week\') palauttaa kursorin jonka range = WeekViewCursorRange', assert => {
        const dateCursor = this.dateCursorFactory.newCursor(Constants.VIEW_WEEK);
        assert.ok(dateCursor.range instanceof DC.WeekViewCursorRange, 'Pitäisi luoda WeekViewCursorRange:n');
    });
    QUnit.test('.newCursor(\'month\') palauttaa kursorin jonka range = MonthViewCursorRange', assert => {
        const dateCursor = this.dateCursorFactory.newCursor(Constants.VIEW_MONTH);
        assert.ok(dateCursor.range instanceof DC.MonthViewCursorRange, 'Pitäisi luoda MonthViewCursorRange:n');
    });
});
