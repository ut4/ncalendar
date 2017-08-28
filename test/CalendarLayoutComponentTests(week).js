import CalendarLayout from '../src/CalendarLayout.js';
import {DateCursorFactory} from '../src/DateCursors.js';
import Constants from '../src/Constants.js';
import {domUtils, dateUtils} from './resources/Utils.js';

QUnit.module('CalendarLayoutComponent(week)', function (hooks) {
    const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
    hooks.beforeEach(() => {
        this.rendered = ReactTestUtils.renderIntoDocument(
            $el(CalendarLayout, {
                titleFormatters: {[Constants.VIEW_WEEK]: titleFormatter}
            })
        );
        this.replicatedCursor = new DateCursorFactory(dateUtils).newCursor(
            Constants.VIEW_WEEK, null, () => {}
        );
    });
    QUnit.test('Renderöi headeriin tuntisarakkeen ja jokaisen viikonpäivän nimen lyhyessä muodossa', assert => {
        const header = ReactTestUtils.findRenderedDOMComponentWithClass(this.rendered, 'header');
        const headerCells = header.querySelectorAll('.cell');
        assert.equal(headerCells.length, 1 + 7);
        assert.equal(headerCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
        const monday = dateUtils.getStartOfWeek(this.replicatedCursor.range.start);
        assert.equal(headerCells[1].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[2].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[3].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[4].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[5].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[6].textContent, getExpectedHeaderCellContent(monday));
        assert.equal(headerCells[7].textContent, getExpectedHeaderCellContent(monday));
    });
    QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
        assert.ok(containsCurrentDayColumns(this.rendered), 'Pitäisi sisältää ".current"-sarake');
        // Paina nappia
        const nextWeekButton = domUtils.findButtonByContent(this.rendered, '>');
        ReactTestUtils.Simulate.click(nextWeekButton);
        // Simuloi next-toiminto
        this.replicatedCursor.next();
        // Assertoi että title päivittyi seuraavaan viikkoon
        const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
        assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
        assert.notOk(containsCurrentDayColumns(this.rendered),
            'Ei pitäisi sisältää ".current"-saraketta, jos kyseessä ei kuluva viikko'
        );
    });
    QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
        // Paina nappia
        const prevWeekButton = domUtils.findButtonByContent(this.rendered, '<');
        ReactTestUtils.Simulate.click(prevWeekButton);
        // Simuloi prev-toiminto
        this.replicatedCursor.prev();
        // Assertoi että title päivittyi edelliseen viikkoon
        const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
        assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
    });
    QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin nykyiselle viikolle', assert => {
        const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
        // Mene pari sivullista eteenpäin
        const nextWeekButton = domUtils.findButtonByContent(this.rendered, '>');
        ReactTestUtils.Simulate.click(nextWeekButton);
        ReactTestUtils.Simulate.click(nextWeekButton);
        // Siirrä takaisin tälle viikolle
        const currentWeekButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
        ReactTestUtils.Simulate.click(currentWeekButton);
        // Assertoi että palautui tälle viikolle
        const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
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
