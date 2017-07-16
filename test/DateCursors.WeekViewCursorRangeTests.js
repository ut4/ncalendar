define(['src/DateCursors', 'src/Constants', 'src/ioc'], (DateCursors, Constants, ioc) => {
    'use strict';
    const dateUtils = ioc.default.dateUtils();
    QUnit.module('DateCursors.WeekViewCursorRange', hooks => {
        hooks.beforeEach(() => {
            this.cursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_WEEK, null, () => {});
        });
        QUnit.test('.construct luo viikon pituisen rangen', assert => {
            const now = new Date();
            const expectedRangeStart = dateUtils.getStartOfWeek(new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                // päivän ensimmäisen tunnin ensimmäinen millisekunti
                0, 0, 0, 1
            ));
            assert.deepEqual(this.cursor.range.start, expectedRangeStart);
            const expectedRangeEnd = new Date(
                expectedRangeStart.getFullYear(),
                expectedRangeStart.getMonth(),
                expectedRangeStart.getDate() + 6,
                // päivän viimeisen tunnin viimeinen millisekunti
                23, 59, 59, 999
            );
            assert.deepEqual(this.cursor.range.end, expectedRangeEnd);
        });
        QUnit.test('.next siirtää rangea viikolla eteenpäin', assert => {
            const expectedStartDate = new Date(this.cursor.range.start);
            expectedStartDate.setDate(expectedStartDate.getDate() + 7);
            const expectedEndDate = new Date(this.cursor.range.end);
            expectedEndDate.setDate(expectedEndDate.getDate() + 7);
            //
            this.cursor.next();
            //
            assert.deepEqual(this.cursor.range.start, expectedStartDate);
            assert.deepEqual(this.cursor.range.end, expectedEndDate);
        });
        QUnit.test('.prev siirtää rangea viikolla taaksepäin', assert => {
            const expectedStartDate = new Date(this.cursor.range.start);
            expectedStartDate.setDate(expectedStartDate.getDate() - 7);
            const expectedEndDate = new Date(this.cursor.range.end);
            expectedEndDate.setDate(expectedEndDate.getDate() - 7);
            //
            this.cursor.prev();
            //
            assert.deepEqual(this.cursor.range.start, expectedStartDate);
            assert.deepEqual(this.cursor.range.end, expectedEndDate);
        });
        QUnit.test('.reset asettaa rangen takaisin nykyiselle viikolle', assert => {
            const initialStart = new Date(this.cursor.range.start);
            const initialEnd = new Date(this.cursor.range.end);
            // Siirrä rangea jonnekkin.
            this.cursor.prev();
            this.cursor.prev();
            // Assertoi että muuttui
            assert.notDeepEqual(this.cursor.range.start, initialStart);
            assert.notDeepEqual(this.cursor.range.end, initialEnd);
            // Kutsu resettiä
            this.cursor.reset();
            // Assertoi että meni takaisin tälle viikolle
            assert.deepEqual(this.cursor.range.start, initialStart);
            assert.deepEqual(this.cursor.range.end, initialEnd);
        });
    });
});
