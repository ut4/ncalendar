define(['src/Header', 'src/DateCursors', 'src/Constants', 'src/ioc'], (Header, DateCursors, Constants, ioc) => {
    'use strict';
    const dateUtils = ioc.default.dateUtils();
    QUnit.module('HeaderComponent', () => {
        QUnit.test('.day renderöi tuntisarakkeen ja current-päivän täydellisen nimen', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_DAY);
            const renderedCells = getRenderedCells(Inferno.TestUtils.renderIntoDocument($el(Header.day, {dateCursor})));
            assert.equal(renderedCells.length, 2);
            assert.equal(renderedCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
            assert.equal(renderedCells[1].textContent, dateUtils.format({weekday: 'long'}, dateCursor.range.start));
        });
        QUnit.test('.week renderöi tuntisarakkeen ja jokaisen viikonpäivän nimen lyhyessä muodossa', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_WEEK);
            const renderedCells = getRenderedCells(Inferno.TestUtils.renderIntoDocument($el(Header.week, {dateCursor})));
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
        QUnit.test('.month renderöi jokaisen viikonpäivän täydellisen nimen', assert => {
            const dateCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_MONTH);
            const renderedCells = getRenderedCells(Inferno.TestUtils.renderIntoDocument($el(Header.month, {dateCursor})));
            assert.equal(renderedCells.length, 7);
            const monday = dateUtils.getStartOfWeek(dateCursor.range.start);
            assert.equal(renderedCells[0].textContent, getLongDayNameAndAddADay(monday));
            assert.equal(renderedCells[1].textContent, getLongDayNameAndAddADay(monday));
            assert.equal(renderedCells[2].textContent, getLongDayNameAndAddADay(monday));
            assert.equal(renderedCells[3].textContent, getLongDayNameAndAddADay(monday));
            assert.equal(renderedCells[4].textContent, getLongDayNameAndAddADay(monday));
            assert.equal(renderedCells[5].textContent, getLongDayNameAndAddADay(monday));
            assert.equal(renderedCells[6].textContent, getLongDayNameAndAddADay(monday));
        });
    });
    function getRenderedCells(rendered) {
        return Inferno.TestUtils.scryRenderedDOMElementsWithClass(rendered, 'cell');
    }
    function getDayNameAndAddADay(date, format = 'short') {
        const dayName = dateUtils.format({weekday: format}, date);
        date.setDate(date.getDate() + 1);
        return dayName;
    }
    function getLongDayNameAndAddADay(date) {
        return getDayNameAndAddADay(date, 'long');
    }
});
