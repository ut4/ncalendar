import CalendarLayout from '../src/CalendarLayout.js';
import Constants from '../src/Constants.js';
import {domUtils, dateUtils} from './resources/Utils.js';

QUnit.module('CalendarLayoutComponent(month)', function () {
    const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
    function render(extraSettings = {}) {
        const rendered = ReactTestUtils.renderIntoDocument(
            $el(CalendarLayout, Object.assign({
                defaultView: Constants.VIEW_MONTH,
                titleFormatters: {[Constants.VIEW_MONTH]: titleFormatter}
            }, extraSettings))
        );
        return [
            rendered,
            ReactTestUtils.findRenderedComponentWithType(rendered, CalendarLayout).controller.dateCursor
        ];
    }
    QUnit.test('Renderöi headeriin tuntisarakkeen ja jokaisen viikonpäivän täydellisen nimen', assert => {
        const [rendered, replicatedCursor] = render();
        const header = ReactTestUtils.findRenderedDOMComponentWithClass(rendered, 'header');
        const headerCells = header.querySelectorAll('.cell');
        assert.equal(headerCells.length, 8);
        const monday = dateUtils.getStartOfWeek(replicatedCursor.range.start);
        assert.equal(headerCells[0].textContent, '');
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
        const nextMonthButton = domUtils.findButtonByContent(rendered, '>');
        ReactTestUtils.Simulate.click(nextMonthButton);
        // Simuloi next-toiminto
        replicatedCursor.next();
        // Assertoi että title päivittyi seuraavaan kuukauteen
        const expectedTitleContent = titleFormatter(replicatedCursor.range);
        assert.equal(domUtils.getElementContent(rendered, 'h2'), expectedTitleContent);
        assert.notOk(containsCurrentDayColumns(rendered),
            'Ei pitäisi sisältää ".current"-saraketta, jos kyseessä ei kuluva kuukausi'
        );
    });
    QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
        const [rendered, replicatedCursor] = render();
        // Paina nappia
        const prevMonthButton = domUtils.findButtonByContent(rendered, '<');
        ReactTestUtils.Simulate.click(prevMonthButton);
        // Simuloi prev-toiminto
        replicatedCursor.prev();
        // Assertoi että title päivittyi edelliseen kuukauteen
        const expectedTitleContent = titleFormatter(replicatedCursor.range);
        assert.equal(domUtils.getElementContent(rendered, 'h2'), expectedTitleContent);
    });
    QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin nykyiselle kuukaudelle', assert => {
        const [rendered] = render();
        const initialTitleContent = domUtils.getElementContent(rendered, 'h2');
        // Mene pari sivullista eteenpäin
        const nextMonthButton = domUtils.findButtonByContent(rendered, '>');
        ReactTestUtils.Simulate.click(nextMonthButton);
        ReactTestUtils.Simulate.click(nextMonthButton);
        // Siirrä takaisin tälle kuukaudelle
        const currentMonthButton = domUtils.findButtonByContent(rendered, 'Tänään');
        ReactTestUtils.Simulate.click(currentMonthButton);
        // Assertoi että palautui tälle kuukaudelle
        const titleContentAfter = domUtils.getElementContent(rendered, 'h2');
        assert.equal(titleContentAfter, initialTitleContent);
    });
    function containsCurrentDayColumns(rendered) {
       return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'current').length > 0;
    }
    function getExpectedHeaderCellContent(date) {
        const dayName = dateUtils.format(date, {weekday: 'long'});
        date.setDate(date.getDate() + 1);
        return dayName;
    }
});
