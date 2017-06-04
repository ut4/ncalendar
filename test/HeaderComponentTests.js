define(['src/Header', 'src/Calendar', 'src/DateUtils',], (Header, Calendar, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    QUnit.module('HeaderComponent', () => {
        QUnit.test('.day renderöi tuntisarakkeen ja current-päivän täydellisen nimen', assert => {
            const renderedCells = getRenderedCells(Inferno.TestUtils.renderIntoDocument($el(Header.day)));
            assert.equal(renderedCells.length, 2);
            assert.equal(renderedCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
            assert.equal(renderedCells[1].textContent, dateUtils.format({weekday: 'long'}, Calendar.state.dateCursor));
        });
        QUnit.test('.week renderöi tuntisarakkeen ja jokaisen viikonpäivän nimen lyhyessä muodossa', assert => {
            const renderedCells = getRenderedCells(Inferno.TestUtils.renderIntoDocument($el(Header.week)));
            assert.equal(renderedCells.length, 1 + 7);
            assert.equal(renderedCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
            const monday = dateUtils.getStartOfWeek(Calendar.state.dateCursor);
            assert.equal(renderedCells[1].textContent, getDayNameAndAddADay(monday));
            assert.equal(renderedCells[2].textContent, getDayNameAndAddADay(monday));
            assert.equal(renderedCells[3].textContent, getDayNameAndAddADay(monday));
            assert.equal(renderedCells[4].textContent, getDayNameAndAddADay(monday));
            assert.equal(renderedCells[5].textContent, getDayNameAndAddADay(monday));
            assert.equal(renderedCells[6].textContent, getDayNameAndAddADay(monday));
            assert.equal(renderedCells[7].textContent, getDayNameAndAddADay(monday));
        });
        QUnit.test('.month renderöi jokaisen viikonpäivän täydellisen nimen', assert => {
            const renderedCells = getRenderedCells(Inferno.TestUtils.renderIntoDocument($el(Header.month)));
            assert.equal(renderedCells.length, 7);
            const monday = dateUtils.getStartOfWeek(Calendar.state.dateCursor);
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
