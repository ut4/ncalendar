define(['src/DateCursors', 'src/Constants'], (DateCursors, Constants) => {
    'use strict';
    QUnit.module('DateCursors.MonthViewCursorRange', hooks => {
        hooks.beforeEach(() => {
            this.cursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_MONTH, null, () => {});
        });
        QUnit.test('.construct luo kuukauden pituisen rangen', assert => {
            const now = new Date();
            const expectedRangeStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
                // päivän ensimmäisen tunnin ensimmäinen millisekunti
                0, 0, 0, 1
            );
            assert.deepEqual(this.cursor.range.start, expectedRangeStart);
            const expectedRangeEnd = new Date(
                now.getFullYear(),
                // https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
                now.getMonth() + 1,
                0,
                // päivän viimeisen tunnin viimeinen millisekunti
                23, 59, 59, 999
            );
            assert.deepEqual(this.cursor.range.end, expectedRangeEnd);
        });
        QUnit.test('.next siirtää rangea kuukaudella eteenpäin', assert => {
            const expectedStartDate = new Date(this.cursor.range.start);
            expectedStartDate.setMonth(expectedStartDate.getMonth() + 1);
            expectedStartDate.setDate(1);
            const expectedEndDate = new Date(this.cursor.range.end);
            expectedEndDate.setMonth(expectedEndDate.getMonth() + 2);
            expectedEndDate.setDate(0);
            //
            this.cursor.next();
            //
            assert.deepEqual(this.cursor.range.start, expectedStartDate);
            assert.deepEqual(this.cursor.range.end, expectedEndDate);
        });
        QUnit.test('.prev siirtää rangea kuukaudella taaksepäin', assert => {
            const expectedStartDate = new Date(this.cursor.range.start);
            expectedStartDate.setMonth(expectedStartDate.getMonth() - 1);
            const expectedEndDate = new Date(this.cursor.range.end);
            expectedEndDate.setDate(0);
            //
            this.cursor.prev();
            //
            assert.deepEqual(this.cursor.range.start, expectedStartDate);
            assert.deepEqual(this.cursor.range.end, expectedEndDate);
        });
        QUnit.test('.reset asettaa takaisin rangeksi tämän kuukauden', assert => {
            const initialStart = new Date(this.cursor.range.start);
            const initialEnd = new Date(this.cursor.range.end);
            // Siirrä rangea jonnekkin.
            this.cursor.next();
            this.cursor.next();
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
