define(['src/Calendar', 'src/Constants', 'test/resources/Utils'], (Calendar, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarComponent(day)', hooks => {
        hooks.beforeEach(() => {
            this.rendered = Inferno.TestUtils.renderIntoDocument($el(Calendar.default, {initialView: Constants.VIEW_DAY}));
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
            const initialTitleContent = domUtils.getTagElementContent(this.rendered, 'h2');
            // Paina nappia
            const nextDayButton = domUtils.findButtonByContent(this.rendered, '>');
            nextDayButton.click();
            // Assertoi että päivittyi
            const titleContentAfter = domUtils.getTagElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            // TODO - testaa että siirtyi eteenpäin
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
            const initialTitleContent = domUtils.getTagElementContent(this.rendered, 'h2');
            // Paina nappia
            const prevDayButton = domUtils.findButtonByContent(this.rendered, '<');
            prevDayButton.click();
            // Assertoi että pävittyi
            const titleContentAfter = domUtils.getTagElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            // TODO - testaa että siirtyi eteenpäin
        });
        QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin tähän päivään', assert => {
            const initialTitleContent = domUtils.getTagElementContent(this.rendered, 'h2');
            // Mene pari sivullista eteenpäin
            const nextDayButton = domUtils.findButtonByContent(this.rendered, '>');
            nextDayButton.click();
            nextDayButton.click();
            // Siirrä takaisin tälle viikolle
            const currentDayButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
            currentDayButton.click();
            // Assertoi että palautui tälle viikolle
            const titleContentAfter = domUtils.getTagElementContent(this.rendered, 'h2');
            assert.equal(titleContentAfter, initialTitleContent);
        });
    });
});
