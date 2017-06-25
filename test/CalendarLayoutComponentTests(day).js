define(['src/CalendarLayout', 'src/DateCursors', 'src/Constants', 'test/resources/Utils'], (CalendarLayout, DateCursors, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarLayoutComponent(day)', hooks => {
        const titleFormatter = dateCursorRange => dateCursorRange.start.toISOString().split('T')[0];
        hooks.beforeEach(() => {
            this.rendered = Inferno.TestUtils.renderIntoDocument(
                $el(CalendarLayout.default, {settings: {
                    defaultView: Constants.VIEW_DAY,
                    titleFormatters: {[Constants.VIEW_DAY]: titleFormatter}
                }})
            );
            this.replicatedCursor = DateCursors.dateCursorFactory.newCursor(Constants.VIEW_DAY, () => {});
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen, ja päivä-headerin', assert => {
            const initialHeaderlineContent = domUtils.getElementContent(this.rendered, '.header');
            // Paina nappia
            const nextDayButton = domUtils.findButtonByContent(this.rendered, '>');
            nextDayButton.click();
            // Simuloi next-toiminto
            this.replicatedCursor.next();
            // Assertoi että title päivittyi seuraavaan päivään
            const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
            assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
            // Assertoi, että headerline päivittyi
            const headerlineContentAfter = domUtils.getElementContent(this.rendered, '.header');
            assert.notEqual(headerlineContentAfter, initialHeaderlineContent);
            // TODO assertoi että headerline meni eteenpäin
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen, ja päivä-headerin', assert => {
            const initialHeaderlineContent = domUtils.getElementContent(this.rendered, '.header');
            // Paina nappia
            const prevDayButton = domUtils.findButtonByContent(this.rendered, '<');
            prevDayButton.click();
            // Simuloi prev-toiminto
            this.replicatedCursor.prev();
            // Assertoi että title päivittyi edelliseen päivään
            const expectedTitleContent = titleFormatter(this.replicatedCursor.range);
            assert.equal(domUtils.getElementContent(this.rendered, 'h2'), expectedTitleContent);
            // Assertoi, että headerline päivittyi
            const headerlineContentAfter = domUtils.getElementContent(this.rendered, '.header');
            assert.notEqual(headerlineContentAfter, initialHeaderlineContent);
            // TODO assertoi että headerline meni taaksepäin
        });
        QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin tähän päivään', assert => {
            const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
            const initialHeaderlineContent = domUtils.getElementContent(this.rendered, '.header');
            // Mene pari sivullista eteenpäin
            const nextDayButton = domUtils.findButtonByContent(this.rendered, '>');
            nextDayButton.click();
            nextDayButton.click();
            // Siirrä takaisin tälle viikolle
            const currentDayButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
            currentDayButton.click();
            // Assertoi että palautui tälle viikolle
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.equal(titleContentAfter, initialTitleContent);
            const headerlineContentAfter = domUtils.getElementContent(this.rendered, '.header');
            assert.equal(headerlineContentAfter, initialHeaderlineContent);
        });
    });
});
