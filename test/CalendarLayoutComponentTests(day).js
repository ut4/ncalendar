import CalendarLayout from '../src/CalendarLayout.js';
import {DateCursorFactory} from '../src/DateCursors.js';
import Constants from '../src/Constants.js';
import {domUtils, dateUtils} from './resources/Utils.js';

QUnit.module('CalendarLayoutComponent(day)', function (hooks) {
    const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
    hooks.beforeEach(() => {
        this.rendered = ReactTestUtils.renderIntoDocument(
            $el(CalendarLayout, {
                defaultView: Constants.VIEW_DAY,
                titleFormatters: {[Constants.VIEW_DAY]: titleFormatter}
            })
        );
        this.replicatedCursor = new DateCursorFactory(dateUtils).newCursor(
            Constants.VIEW_DAY, null, () => {}
        );
    });
    QUnit.test('Renderöi headeriin tuntisarakkeen ja current-päivän täydellisen nimen', assert => {
        const header = ReactTestUtils.findRenderedDOMComponentWithClass(this.rendered, 'header');
        const headerCells = header.querySelectorAll('.cell');
        assert.equal(headerCells.length, 2);
        assert.equal(headerCells[0].textContent, '');// Tuntisarake pitää olla tyhjä
        assert.equal(headerCells[1].textContent, dateUtils.format(this.replicatedCursor.range.start, {weekday: 'long'}));
    });
    QUnit.test('Toolbarin next-sivutuspainike päivittää titlen, ja päivä-headerin', assert => {
        assert.ok(containsCurrentDayColumns(this.rendered), 'Pitäisi sisältää ".current"-sarake');
        // Paina nappia
        const nextDayButton = domUtils.findButtonByContent(this.rendered, '>');
        ReactTestUtils.Simulate.click(nextDayButton);
        // Simuloi next-toiminto
        this.replicatedCursor.next();
        // Assertoi että title päivittyi seuraavaan päivään
        const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
        assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
        // Assertoi, että header päivittyi
        const headerContentAfter = domUtils.getElementContent(this.rendered, '.header');
        const expectedHeaderContent = getWeekDay(this.replicatedCursor.range.start);
        assert.equal(headerContentAfter, expectedHeaderContent);
        assert.notOk(containsCurrentDayColumns(this.rendered),
            'Ei pitäisi sisältää ".current"-saraketta, jos kyseessä ei kuluva päivä'
        );
    });
    QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen, ja päivä-headerin', assert => {
        // Paina nappia
        const prevDayButton = domUtils.findButtonByContent(this.rendered, '<');
        ReactTestUtils.Simulate.click(prevDayButton);
        // Simuloi prev-toiminto
        this.replicatedCursor.prev();
        // Assertoi että title päivittyi edelliseen päivään
        const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
        assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
        // Assertoi, että header päivittyi
        const headerContentAfter = domUtils.getElementContent(this.rendered, '.header');
        const expectedHeaderContent = getWeekDay(this.replicatedCursor.range.start);
        assert.equal(headerContentAfter, expectedHeaderContent);
    });
    QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin tähän päivään', assert => {
        const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
        const initialHeaderlineContent = domUtils.getElementContent(this.rendered, '.header');
        // Mene pari sivullista eteenpäin
        const nextDayButton = domUtils.findButtonByContent(this.rendered, '>');
        ReactTestUtils.Simulate.click(nextDayButton);
        ReactTestUtils.Simulate.click(nextDayButton);
        assert.notEqual(domUtils.getElementContent(this.rendered, 'h2'), initialTitleContent);
        assert.notEqual(domUtils.getElementContent(this.rendered, '.header'), initialHeaderlineContent);
        // Siirrä takaisin tälle viikolle
        const currentDayButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
        ReactTestUtils.Simulate.click(currentDayButton);
        // Assertoi että palautui tälle viikolle
        const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
        assert.equal(titleContentAfter, initialTitleContent);
        const headerContentAfter = domUtils.getElementContent(this.rendered, '.header');
        assert.equal(headerContentAfter, initialHeaderlineContent);
    });
    function containsCurrentDayColumns(rendered) {
       return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'current').length > 0;
    }
    function getWeekDay(date) {
        return dateUtils.format(date, {weekday: 'long'});
    }
});
