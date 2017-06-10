define(['src/Calendar', 'src/DateCursors', 'src/Constants', 'test/resources/Utils'], (Calendar, DateCursors, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarComponent(month)', hooks => {
        const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
        hooks.beforeEach(() => {
            this.rendered = Inferno.TestUtils.renderIntoDocument(
                $el(Calendar.default, {settings: {
                    defaultView: Constants.VIEW_MONTH,
                    titleFormatters: {[Constants.VIEW_MONTH]: titleFormatter}
                }})
            );
            this.replicatedCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_MONTH, () => {});
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
            // Paina nappia
            const nextMonthButton = domUtils.findButtonByContent(this.rendered, '>');
            nextMonthButton.click();
            // Simuloi next-toiminto
            this.replicatedCursor.next();
            // Assertoi että title päivittyi seuraavaan kuukauteen
            const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
            assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
            // Paina nappia
            const prevMonthButton = domUtils.findButtonByContent(this.rendered, '<');
            prevMonthButton.click();
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
            nextMonthButton.click();
            nextMonthButton.click();
            // Siirrä takaisin tälle kuukaudelle
            const currentMonthButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
            currentMonthButton.click();
            // Assertoi että palautui tälle kuukaudelle
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.equal(titleContentAfter, initialTitleContent);
        });
    });
});
