define(['src/CalendarLayout', 'src/DateCursors', 'src/Constants', 'test/resources/Utils'], (CalendarLayout, DateCursors, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarLayoutComponent(month)', hooks => {
        const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
        hooks.beforeEach(() => {
            this.rendered = ReactTestUtils.renderIntoDocument(
                $el(CalendarLayout.default, {settings: {
                    defaultView: Constants.VIEW_MONTH,
                    titleFormatters: {[Constants.VIEW_MONTH]: titleFormatter}
                }})
            );
            this.replicatedCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_MONTH, null, () => {});
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
            assert.ok(containsCurrentDayColumns(this.rendered), 'Pitäisi sisältää ".current"-sarake');
            // Paina nappia
            const nextMonthButton = domUtils.findButtonByContent(this.rendered, '>');
            ReactTestUtils.Simulate.click(nextMonthButton);
            // Simuloi next-toiminto
            this.replicatedCursor.next();
            // Assertoi että title päivittyi seuraavaan kuukauteen
            const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
            assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
            assert.notOk(containsCurrentDayColumns(this.rendered),
                'Ei pitäisi sisältää ".current"-saraketta, jos kyseessä ei kuluva kuukausi'
            );
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
            // Paina nappia
            const prevMonthButton = domUtils.findButtonByContent(this.rendered, '<');
            ReactTestUtils.Simulate.click(prevMonthButton);
            // Simuloi prev-toiminto
            this.replicatedCursor.prev();
            // Assertoi että title päivittyi edelliseen kuukauteen
            const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
            assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
        });
        QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin nykyiselle kuukaudelle', assert => {
            const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
            // Mene pari sivullista eteenpäin
            const nextMonthButton = domUtils.findButtonByContent(this.rendered, '>');
            ReactTestUtils.Simulate.click(nextMonthButton);
            ReactTestUtils.Simulate.click(nextMonthButton);
            // Siirrä takaisin tälle kuukaudelle
            const currentMonthButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
            ReactTestUtils.Simulate.click(currentMonthButton);
            // Assertoi että palautui tälle kuukaudelle
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.equal(titleContentAfter, initialTitleContent);
        });
        function containsCurrentDayColumns(rendered) {
           return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'current').length > 0;
        }
    });
});
