import Content from '../src/Content.js';
import ViewLayouts from '../src/ViewLayouts.js';
import {dateCursorFactory} from '../src/DateCursors.js';
import Constants from '../src/Constants.js';
import ioc from '../src/ioc.js';

const dateUtils = ioc.dateUtils();
const newDateCursor = dateCursorFactory.newCursor;

QUnit.module('ContentComponent', function (hooks) {
    hooks.afterEach(assert => {
        if (!this.expectedCurrentDayColEls.length) {
            throw new Error('Nyt on Sepon logiikka pettänyt.. gridillä pitäisi olla ' +
            'ainakin yksi sarake, jossa CSS-luokka ".current"');
        }
        assert.ok(this.expectedCurrentDayColEls.every(el => el.classList.contains('current')),
            'Pitäisi asettaa kuluvan päivän sarakkeisiin CSS-luokka ".current"'
        );
    });
    QUnit.test('day-gridillä renderöi 24-riviä joissa tuntisolu, ja 1 sisältösolu', assert => {
        const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
            $el(Content, makeProps(Constants.VIEW_DAY))
        ));
        assert.equal(renderedRows.length, 24);
        this.expectedCurrentDayColEls = [];
        renderedRows.forEach((row, hour) => {
            assert.equal(row.children[0].textContent, dateUtils.formatHour(hour)); // Tuntisarake
            assert.equal(row.children[1].textContent, '');                         // Sisältösolu
            this.expectedCurrentDayColEls.push(row.children[1]);
            assert.equal(row.children.length, 2);
        });
    });
    QUnit.test('week-gridillä renderöi 24-riviä joissa tuntisolu, ja 7 sisältösolua', assert => {
        const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
            $el(Content, makeProps(Constants.VIEW_WEEK))
        ));
        assert.equal(renderedRows.length, 24);
        this.expectedCurrentDayColEls = [];
        const expectedCurrentDayColIndex = new Date().getDay() || 7;
        renderedRows.forEach((row, hour) => {
            assert.equal(row.children[0].textContent, dateUtils.formatHour(hour)); // Tuntisarake
            assert.equal(row.children[1].textContent, '');                         // Sisältösolu (maanantai)
            // kertaa 7
            assert.equal(row.children.length, 8);
            this.expectedCurrentDayColEls.push(row.children[expectedCurrentDayColIndex]);
        });
    });
    QUnit.test('compact week-gridillä renderöi 4-riviä joissa 2 päiväsolua otsikkona täydellinen viikonpäivän nimi', assert => {
        const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
            $el(Content, makeProps(Constants.VIEW_WEEK, true))
        ));
        assert.equal(renderedRows.length, 4);
        const dayNames = dateUtils.getFormattedWeekDays(new Date(), 'long');
        const expectedCurrentDayColIndex = new Date().getDay() || 7;
        [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0]].forEach(([rowIdx, colIdx], i) => {
            assert.equal(renderedRows[rowIdx].children[colIdx].textContent, dayNames[i]);
            if (i + 1 === expectedCurrentDayColIndex) {
                this.expectedCurrentDayColEls = [renderedRows[rowIdx].children[colIdx]];
            }
        });
        assert.equal(renderedRows[3].children[1].textContent, '');
    });
    QUnit.test('month-gridillä renderöi solun jokaiselle kuukauden päivälle 7-levyisinä riveinä', assert => {
        const expectedRowLength = 1 + Constants.DAYS_IN_WEEK; // viikkonumerosarake + viikonpäivät
        const dateCursor = newDateCursor(Constants.VIEW_MONTH);
        const renderedRows = getRenderedRows(ReactTestUtils.renderIntoDocument(
            $el(Content, makeProps(Constants.VIEW_MONTH))
        ));
        const rangeStart = new Date(dateCursor.range.start);
        // Assertoi, että generoi oikean määrän rivejä
        assert.equal(renderedRows.length, getExpectedMonthCellCount(dateCursor, 7) / expectedRowLength);
        // Assertoi, että renderöi päivänumeron vain tämän kuukauden soluihin, ja renderöi viikkonumeron
        // jokaisen rivin alkuun
        const currentDayDateStr = new Date().toDateString();
        const rollingDate = new Date(rangeStart);
        rollingDate.setDate(2 - (rollingDate.getDay() || 7));// tyhjien solujen lukumäärä
        renderedRows.forEach(row => {
            Array.from(row.children).forEach((col, i) => {
                if (i) {
                    assert.equal(col.textContent, rollingDate.getMonth() === rangeStart.getMonth() ? rollingDate.getDate() : '');
                    if (rollingDate.toDateString() === currentDayDateStr) {
                        this.expectedCurrentDayColEls = [col];
                    }
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
            $el(Content, makeProps(Constants.VIEW_MONTH, true))
        ));
        assert.equal(renderedRows.length, getExpectedMonthCellCount(dateCursor, 2) / 2);
        const currentDayDateStr = new Date().toDateString();
        const rangeStart = new Date(dateCursor.range.start);
        const rollingDate = new Date(dateCursor.range.start);
        renderedRows.forEach(row => {
            [0,1].forEach(i => {
                assert.equal(row.children[i].textContent, getExpectedCompactMonthCellTitle(rollingDate, rangeStart));
                if (rollingDate.toDateString() === currentDayDateStr) {
                    this.expectedCurrentDayColEls = [row.children[i]];
                }
                rollingDate.setDate(rollingDate.getDate() + 1);
            });
            assert.equal(row.children.length, 2);
        });
    });
});
function makeProps(selectedView, compactFormShouldBeUsed) {
    return {
        grid: (new ViewLayouts[selectedView](newDateCursor(selectedView)))
            .getParts(compactFormShouldBeUsed)[1].props.gridGeneratorFn(),
        calendarController: {settings: {contentLayers: []}}// fake calendarController
    };
}
function getRenderedRows(rendered) {
    return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'row');
}
function getExpectedCompactMonthCellTitle(date, rangeStart) {
    if (date.getMonth() !== rangeStart.getMonth()) {
        return '';
    }
    const isFirstCell = date.toISOString() === rangeStart.toISOString();
    return date.getDate() + ' ' + dateUtils.format(date, {weekday: 'short'}) +
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
