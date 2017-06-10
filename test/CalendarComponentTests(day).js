define(['src/Calendar', 'src/Constants', 'test/resources/Utils'], (Calendar, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarComponent(day)', hooks => {
        hooks.beforeEach(() => {
            this.rendered = Inferno.TestUtils.renderIntoDocument(
                $el(Calendar.default, {initialView: Constants.VIEW_DAY})
            );
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen, ja päivä-headerin', assert => {
            const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
            const initialHeaderlineContent = domUtils.getElementContent(this.rendered, '.header');
            // Paina nappia
            const nextDayButton = domUtils.findButtonByContent(this.rendered, '>');
            nextDayButton.click();
            // Assertoi että päivittyi
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            const headerlineContentAfter = domUtils.getElementContent(this.rendered, '.header');
            assert.notEqual(headerlineContentAfter, initialHeaderlineContent);
            // TODO - testaa että siirtyi eteenpäin
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen, ja päivä-headerin', assert => {
            const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
            const initialHeaderlineContent = domUtils.getElementContent(this.rendered, '.header');
            // Paina nappia
            const prevDayButton = domUtils.findButtonByContent(this.rendered, '<');
            prevDayButton.click();
            // Assertoi että pävittyi
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            const headerlineContentAfter = domUtils.getElementContent(this.rendered, '.header');
            assert.notEqual(headerlineContentAfter, initialHeaderlineContent);
            // TODO - testaa että siirtyi eteenpäin
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
