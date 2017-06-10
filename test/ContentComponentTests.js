define(['src/Content', 'src/DateCursors', 'src/Constants', 'src/DateUtils',], (Content, DateCursors, Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    QUnit.module('ContentComponent', () => {
        QUnit.test('.day renderöi 24-riviä joissa tuntisolu, ja 1 sisältösolu', assert => {
            const renderedRows = getRenderedRows(Inferno.TestUtils.renderIntoDocument($el(Content.day)));
            assert.equal(renderedRows.length, 24);
            renderedRows.forEach((row, hour) => {
                assert.equal(row.children[0].textContent, dateUtils.formatHour(hour)); // Tuntisarake
                assert.equal(row.children[1].textContent, '');                         // Sisältösolu
                assert.equal(row.children.length, 2);
            });
        });
        QUnit.test('.week renderöi 24-riviä joissa tuntisolu, ja 7 sisältösolua', assert => {
            const renderedRows = getRenderedRows(Inferno.TestUtils.renderIntoDocument(
                $el(Content.week, {dateCursor: DateCursors.dateCursorFactory.newCursor(Constants.VIEW_WEEK)})
            ));
            assert.equal(renderedRows.length, 24);
            renderedRows.forEach((row, hour) => {
                assert.equal(row.children[0].textContent, dateUtils.formatHour(hour)); // Tuntisarake
                assert.equal(row.children[1].textContent, '');                         // Sisältösolu (maanantai)
                // kertaa 7
                assert.equal(row.children.length, 8);
            });
        });
        QUnit.test('.week (mobile) renderöi 4-riviä joissa 2 päiväsolua otsikkona täydellinen viikonpäivän nimi', assert => {
            const renderedRows = getRenderedRows(Inferno.TestUtils.renderIntoDocument(
                $el(Content.week, {
                    isMobileViewEnabled: true,
                    dateCursor: DateCursors.dateCursorFactory.newCursor(Constants.VIEW_WEEK)
                })
            ));
            assert.equal(renderedRows.length, 4);
            const dayNames = dateUtils.getFormattedWeekDays(
                new Date(),
                Intl.DateTimeFormat('fi', {weekday: 'long'})
            );
            assert.equal(renderedRows[0].children[0].textContent, dayNames[0]);
            assert.equal(renderedRows[0].children[1].textContent, dayNames[1]);
            assert.equal(renderedRows[1].children[0].textContent, dayNames[2]);
            assert.equal(renderedRows[1].children[1].textContent, dayNames[3]);
            assert.equal(renderedRows[2].children[0].textContent, dayNames[4]);
            assert.equal(renderedRows[2].children[1].textContent, dayNames[5]);
            assert.equal(renderedRows[3].children[0].textContent, dayNames[6]);
            assert.equal(renderedRows[3].children[1].textContent, 'Tällä viikolla: 0 tapahtumaa');
        });
        QUnit.test('.month renderöi solun jokaiselle kuukauden päivälle 7-levyisinä riveinä', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_MONTH);
            const renderedRows = getRenderedRows(Inferno.TestUtils.renderIntoDocument($el(Content.month, {dateCursor})));
            assert.equal(renderedRows.length, 5);
            const d = new Date(dateCursor.range.start);
            d.setDate(1);
            renderedRows.forEach(row => {
                assert.equal(row.children[0].textContent, d.getDate()); // Sisältösolu (maanantai)
                d.setDate(d.getDate() + 1);
                assert.equal(row.children[1].textContent, d.getDate()); // ...
                d.setDate(d.getDate() + 6);
                assert.equal(row.children.length, 7);
            });
        });
        QUnit.test('.month (mobile) renderöi solun jokaiselle kuukauden päivälle 2-levyisinä riveinä otsikkona numeerinen kuukauden päivä ja viikonpäivän nimi', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_MONTH);
            const renderedRows = getRenderedRows(Inferno.TestUtils.renderIntoDocument(
                $el(Content.month, {isMobileViewEnabled: true, dateCursor})
            ));
            assert.equal(renderedRows.length, 15);
            const d = new Date(dateCursor.range.start);
            d.setDate(1);
            renderedRows.forEach(row => {
                assert.equal(row.children[0].textContent, getExpectedMobileMonthCellTitle(d));
                d.setDate(d.getDate() + 1);
                assert.equal(row.children[1].textContent, getExpectedMobileMonthCellTitle(d));
                d.setDate(d.getDate() + 1);
                assert.equal(row.children.length, 2);
            });
        });
    });
    function getRenderedRows(rendered) {
        return Inferno.TestUtils.scryRenderedDOMElementsWithClass(rendered, 'fluid');
    }
    const dayNames = dateUtils.getFormattedWeekDays(
        new Date(),
        Intl.DateTimeFormat('fi', {weekday: 'short'})
    );
    function getExpectedMobileMonthCellTitle(date) {
        return date.getDate() + ' ' + dayNames[date.getDay()];
    }
});
