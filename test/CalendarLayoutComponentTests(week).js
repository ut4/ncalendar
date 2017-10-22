import CalendarLayout from '../src/CalendarLayout.js';
import Constants from '../src/Constants.js';
import {domUtils, dateUtils} from './resources/Utils.js';

QUnit.module('CalendarLayoutComponent(week)', function () {
    const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
    function render(extraSettings = {}) {
        const rendered = ReactTestUtils.renderIntoDocument(
            $el(CalendarLayout, Object.assign({
                titleFormatters: {[Constants.VIEW_WEEK]: titleFormatter}
            }, extraSettings))
        );
        return [
            rendered,
            ReactTestUtils.findRenderedComponentWithType(rendered, CalendarLayout).controller.dateCursor
        ];
    }
    QUnit.test('Renderöi headeriin tuntisarakkeen ja jokaisen viikonpäivän nimen lyhyessä muodossa', assert => {
        const [rendered, replicatedCursor] = render();
        const header = ReactTestUtils.findRenderedDOMComponentWithClass(rendered, 'header');
        const headerCells = header.querySelectorAll('.cell');
        assert.equal(headerCells.length, 1 + 7);
        assert.equal(headerCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
        const monday = dateUtils.getStartOfWeek(replicatedCursor.range.start);
        assert.equal(headerCells[1].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[2].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[3].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[4].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[5].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[6].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[7].textContent, getExpectedHeaderCellContent(monday));
    });
    QUnit.test('Renderöi asetuksiin määritellyn firstDayOfWeek:n ensimmäisenä', assert => {
        const [rendered] = render({firstDayOfWeek: 0});
        const header = ReactTestUtils.findRenderedDOMComponentWithClass(rendered, 'header');
        const headerCells = header.querySelectorAll('.cell');
        const sunday = new Date(2017, 9, 22, 12);
        assert.equal(headerCells[1].textContent, getExpectedHeaderCellContent(sunday));
    });
    QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
        const [rendered, replicatedCursor] = render();
        assert.ok(containsCurrentDayColumns(rendered), 'Pitäisi sisältää ".current"-sarake');
        // Paina nappia
        const nextWeekButton = domUtils.findButtonByContent(rendered, '>');
        ReactTestUtils.Simulate.click(nextWeekButton);
        // Simuloi next-toiminto
        replicatedCursor.next();
        // Assertoi että title päivittyi seuraavaan viikkoon
        const expectedTitleContent = titleFormatter(replicatedCursor.range);
        assert.equal(domUtils.getElementContent(rendered, 'h2'), expectedTitleContent);
        assert.notOk(containsCurrentDayColumns(rendered),
            'Ei pitäisi sisältää ".current"-saraketta, jos kyseessä ei kuluva viikko'
        );
    });
    QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
        const [rendered, replicatedCursor] = render();
        // Paina nappia
        const prevWeekButton = domUtils.findButtonByContent(rendered, '<');
        ReactTestUtils.Simulate.click(prevWeekButton);
        // Simuloi prev-toiminto
        replicatedCursor.prev();
        // Assertoi että title päivittyi edelliseen viikkoon
        const expectedTitleContent = titleFormatter(replicatedCursor.range);
        assert.equal(domUtils.getElementContent(rendered, 'h2'), expectedTitleContent);
    });
    QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin nykyiselle viikolle', assert => {
        const [rendered] = render();
        const initialTitleContent = domUtils.getElementContent(rendered, 'h2');
        // Mene pari sivullista eteenpäin
        const nextWeekButton = domUtils.findButtonByContent(rendered, '>');
        ReactTestUtils.Simulate.click(nextWeekButton);
        ReactTestUtils.Simulate.click(nextWeekButton);
        // Siirrä takaisin tälle viikolle
        const currentWeekButton = domUtils.findButtonByContent(rendered, 'Tänään');
        ReactTestUtils.Simulate.click(currentWeekButton);
        // Assertoi että palautui tälle viikolle
        const titleContentAfter = domUtils.getElementContent(rendered, 'h2');
        assert.equal(titleContentAfter, initialTitleContent);
    });
    function containsCurrentDayColumns(rendered) {
       return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'current').length > 0;
    }
    function getExpectedHeaderCellContent(date) {
        const dayName = dateUtils.format(date, {weekday: 'short'});
        date.setDate(date.getDate() + 1);
        return dayName;
    }
});
