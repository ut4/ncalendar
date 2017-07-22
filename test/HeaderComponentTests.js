import Header from '../src/Header.js';
import {dateCursorFactory} from '../src/DateCursors.js';
import Constants from '../src/Constants.js';
import ioc from '../src/ioc.js';

const dateUtils = ioc.dateUtils();

QUnit.module('HeaderComponent', function () {
    QUnit.test('.day renderöi tuntisarakkeen ja current-päivän täydellisen nimen', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_DAY);
        const renderedCells = getRenderedCells(ReactTestUtils.renderIntoDocument($el(Header.day, {dateCursor})));
        assert.equal(renderedCells.length, 2);
        assert.equal(renderedCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
        assert.equal(renderedCells[1].textContent, dateUtils.format({weekday: 'long'}, dateCursor.range.start));
    });
    QUnit.test('.week renderöi tuntisarakkeen ja jokaisen viikonpäivän nimen lyhyessä muodossa', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_WEEK);
        const renderedCells = getRenderedCells(ReactTestUtils.renderIntoDocument($el(Header.week, {dateCursor})));
        assert.equal(renderedCells.length, 1 + 7);
        assert.equal(renderedCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
        const monday = dateUtils.getStartOfWeek(dateCursor.range.start);
        assert.equal(renderedCells[1].textContent, getDayNameAndAddADay(monday));
        assert.equal(renderedCells[2].textContent, getDayNameAndAddADay(monday));
        assert.equal(renderedCells[3].textContent, getDayNameAndAddADay(monday));
        assert.equal(renderedCells[4].textContent, getDayNameAndAddADay(monday));
        assert.equal(renderedCells[5].textContent, getDayNameAndAddADay(monday));
        assert.equal(renderedCells[6].textContent, getDayNameAndAddADay(monday));
        assert.equal(renderedCells[7].textContent, getDayNameAndAddADay(monday));
    });
    QUnit.test('.month renderöi viikkonumerosarakkeen, ja jokaisen viikonpäivän täydellisen nimen', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_MONTH);
        const renderedCells = getRenderedCells(ReactTestUtils.renderIntoDocument($el(Header.month, {dateCursor})));
        assert.equal(renderedCells.length, 8);
        const monday = dateUtils.getStartOfWeek(dateCursor.range.start);
        assert.equal(renderedCells[0].textContent, '');
        assert.equal(renderedCells[1].textContent, getLongDayNameAndAddADay(monday));
        assert.equal(renderedCells[2].textContent, getLongDayNameAndAddADay(monday));
        assert.equal(renderedCells[3].textContent, getLongDayNameAndAddADay(monday));
        assert.equal(renderedCells[4].textContent, getLongDayNameAndAddADay(monday));
        assert.equal(renderedCells[5].textContent, getLongDayNameAndAddADay(monday));
        assert.equal(renderedCells[6].textContent, getLongDayNameAndAddADay(monday));
        assert.equal(renderedCells[7].textContent, getLongDayNameAndAddADay(monday));
    });
});
function getRenderedCells(rendered) {
    return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'cell');
}
function getDayNameAndAddADay(date, format = 'short') {
    const dayName = dateUtils.format({weekday: format}, date);
    date.setDate(date.getDate() + 1);
    return dayName;
}
function getLongDayNameAndAddADay(date) {
    return getDayNameAndAddADay(date, 'long');
}
