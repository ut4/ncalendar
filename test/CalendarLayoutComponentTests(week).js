define(['src/CalendarLayout', 'src/DateCursors', 'src/Constants', 'test/resources/Utils'], (CalendarLayout, DateCursors, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarLayoutComponent(week)', hooks => {
        const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
        hooks.beforeEach(() => {
            this.rendered = Inferno.TestUtils.renderIntoDocument(
                $el(CalendarLayout.default, {settings: {
                    titleFormatters: {[Constants.VIEW_WEEK]: titleFormatter}
                }})
            );
            this.replicatedCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_WEEK, () => {});
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
            // Paina nappia
            const nextWeekButton = domUtils.findButtonByContent(this.rendered, '>');
            nextWeekButton.click();
            // Simuloi next-toiminto
            this.replicatedCursor.next();
            // Assertoi että title päivittyi seuraavaan viikkoon
            const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
            assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
            // Paina nappia
            const prevWeekButton = domUtils.findButtonByContent(this.rendered, '<');
            prevWeekButton.click();
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
            nextWeekButton.click();
            nextWeekButton.click();
            // Siirrä takaisin tälle viikolle
            const currentWeekButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
            currentWeekButton.click();
            // Assertoi että palautui tälle viikolle
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.equal(titleContentAfter, initialTitleContent);
        });
    });
});
