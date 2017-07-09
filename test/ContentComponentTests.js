define(['src/Content', 'src/ViewLayouts', 'src/DateCursors', 'src/Constants', 'src/ioc'], (Content, ViewLayouts, DateCursors, Constants, ioc) => {
    'use strict';
    const dateUtils = ioc.default.dateUtils();
    const newDateCursor = DateCursors.dateCursorFactory.newCursor;
    QUnit.module('ContentComponent', () => {
        QUnit.test('day-gridillä renderöi 24-riviä joissa tuntisolu, ja 1 sisältösolu', assert => {
            const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
                $el(Content.default, makeProps(Constants.VIEW_DAY))
            ));
            assert.equal(renderedRows.length, 24);
            renderedRows.forEach((row, hour) => {
                assert.equal(row.children[0].textContent, dateUtils.formatHour(hour)); // Tuntisarake
                assert.equal(row.children[1].textContent, '');                         // Sisältösolu
                assert.equal(row.children.length, 2);
            });
        });
        QUnit.test('week-gridillä renderöi 24-riviä joissa tuntisolu, ja 7 sisältösolua', assert => {
            const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
                $el(Content.default, makeProps(Constants.VIEW_WEEK))
            ));
            assert.equal(renderedRows.length, 24);
            renderedRows.forEach((row, hour) => {
                assert.equal(row.children[0].textContent, dateUtils.formatHour(hour)); // Tuntisarake
                assert.equal(row.children[1].textContent, '');                         // Sisältösolu (maanantai)
                // kertaa 7
                assert.equal(row.children.length, 8);
            });
        });
        QUnit.test('compact week-gridillä renderöi 4-riviä joissa 2 päiväsolua otsikkona täydellinen viikonpäivän nimi', assert => {
            const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
                $el(Content.default, makeProps(Constants.VIEW_WEEK, true))
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
            assert.equal(renderedRows[3].children[1].textContent, '');
        });
        QUnit.test('month-gridillä renderöi solun jokaiselle kuukauden päivälle 7-levyisinä riveinä', assert => {
            const expectedRowLength = 1 + Constants.DAYS_IN_WEEK; // viikkonumerosarake + viikonpäivät
            const dateCursor = newDateCursor(Constants.VIEW_MONTH);
            const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
                $el(Content.default, makeProps(Constants.VIEW_MONTH))
            ));
            const currentDate = new Date(dateCursor.range.start);
            // Assertoi, että generoi oikean määrän rivejä
            assert.equal(renderedRows.length, getExpectedMonthCellCount(dateCursor, 7) / expectedRowLength);
            // Assertoi, että renderöi päivänumeron vain tämän kuukauden soluihin, ja renderöi viikkonumeron
            // jokaisen rivin alkuun
            const rollingDate = new Date(currentDate);
            rollingDate.setDate(2 - (rollingDate.getDay() || 7));// tyhjien solujen lukumäärä
            renderedRows.forEach(row => {
                Array.from(row.children).forEach((col, i) => {
                    if (i) {
                        assert.equal(col.textContent, rollingDate.getMonth() === currentDate.getMonth() ? rollingDate.getDate() : '');
                        rollingDate.setDate(rollingDate.getDate() + 1);
                    } else {
                        assert.equal(col.textContent, dateUtils.getWeekNumber(rollingDate),
                            'Rivin ensimmäisessä solussa tulisi olla viikkonumero'
                        );
                    }
                });
                assert.equal(row.children.length, expectedRowLength,
                    'Jokaisen rivin pitäisi olla tämän pituinen'
                );
            });
        });
        QUnit.test('compact month-gridillä renderöi solun jokaiselle kuukauden päivälle 2-levyisinä riveinä otsikkona numeerinen kuukauden päivä ja viikonpäivän nimi', assert => {
            const dateCursor = newDateCursor(Constants.VIEW_MONTH);
            const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
                $el(Content.default, makeProps(Constants.VIEW_MONTH, true))
            ));
            assert.equal(renderedRows.length, getExpectedMonthCellCount(dateCursor, 2) / 2);
            const currentDate = new Date(dateCursor.range.start);
            const rollingDate = new Date(dateCursor.range.start);
            renderedRows.forEach(row => {
                assert.equal(row.children[0].textContent, getExpectedCompactMonthCellTitle(rollingDate, currentDate));
                rollingDate.setDate(rollingDate.getDate() + 1);
                assert.equal(row.children[1].textContent, getExpectedCompactMonthCellTitle(rollingDate, currentDate));
                rollingDate.setDate(rollingDate.getDate() + 1);
                assert.equal(row.children.length, 2);
            });
        });
    });
    function makeProps(selectedView, compactFormShouldBeUsed) {
        return {
            grid: (new ViewLayouts[selectedView](newDateCursor(selectedView)))
                .getParts(compactFormShouldBeUsed)[1].props.gridGeneratorFn(),
            calendarController: {settings: {contentLayers: []}}
        };
    }
    function getRenderedRows(rendered) {
        return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'row');
    }
    function getExpectedCompactMonthCellTitle(date, currentDate) {
        if (date.getMonth() !== currentDate.getMonth()) {
            return '';
        }
        const isFirstCell = date.toISOString() === currentDate.toISOString();
        return date.getDate() + ' ' + dateUtils.format({weekday: 'short'}, date) +
            // Pitäisi sisältää viikkonumero, jos viikon ensimmäinen päivä, tai gridin ensimmäinen solu
            (date.getDay() !== 1 && !isFirstCell ? '' : ' / Vk' + dateUtils.getWeekNumber(date));
    }
    function getExpectedMonthCellCount(dateCursor, gridWidth) {
        let expectedCellCount = dateCursor.range.end.getDate();
        // Ensimmäisen viikon tyhjät
        if (gridWidth === Constants.DAYS_IN_WEEK) {
            expectedCellCount += dateCursor.range.start.getDay() || 6;
        }
        expectedCellCount += gridWidth - (expectedCellCount % gridWidth || gridWidth);
        // Yksi tyhjä (viikonpäivasarake) jokaiselle riville
        if (gridWidth === Constants.DAYS_IN_WEEK) {
            expectedCellCount += expectedCellCount / gridWidth;
        }
        return expectedCellCount;
    }
});
