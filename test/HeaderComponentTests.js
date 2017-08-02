import Header from '../src/Header.js';
import {DateCursorFactory} from '../src/DateCursors.js';
import Constants from '../src/Constants.js';
import {dateUtils} from './resources/Utils.js';

const dateCursorFactory = new DateCursorFactory(dateUtils);

QUnit.module('HeaderComponent', function () {
    QUnit.test('.day renderöi tuntisarakkeen ja current-päivän täydellisen nimen', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_DAY);
        const renderedCells = getRenderedCells(renderHeader(Constants.VIEW_DAY, dateCursor));
        assert.equal(renderedCells.length, 2);
        assert.equal(renderedCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
        assert.equal(renderedCells[1].textContent, dateUtils.format(dateCursor.range.start, {weekday: 'long'}));
    });
    QUnit.test('.week renderöi tuntisarakkeen ja jokaisen viikonpäivän nimen lyhyessä muodossa', assert => {
        const dateCursor = dateCursorFactory.newCursor(Constants.VIEW_WEEK);
        const renderedCells = getRenderedCells(renderHeader(Constants.VIEW_WEEK, dateCursor));
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
        const renderedCells = getRenderedCells(renderHeader(Constants.VIEW_MONTH, dateCursor));
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
function renderHeader(form, dateCursor) {
    return ReactTestUtils.renderIntoDocument($el(Header[form], {dateCursor, dateUtils}));
}
function getRenderedCells(rendered) {
    return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'cell');
}
function getDayNameAndAddADay(date, format = 'short') {
    const dayName = dateUtils.format(date, {weekday: format});
    date.setDate(date.getDate() + 1);
    return dayName;
}
function getLongDayNameAndAddADay(date) {
    return getDayNameAndAddADay(date, 'long');
}
