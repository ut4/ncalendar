define(['src/Calendar', 'src/Constants', 'test/resources/Utils'], (Calendar, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarComponent(week)', hooks => {
        hooks.beforeEach(() => {
            this.rendered = Inferno.TestUtils.renderIntoDocument($el(Calendar.default));
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
            const initialTitleContent = domUtils.getTagElementContent(this.rendered, 'h2');
            // Paina nappia
            const nextWeekButton = domUtils.findButtonByContent(this.rendered, '>');
            nextWeekButton.click();
            // Assertoi että päivittyi
            const titleContentAfter = domUtils.getTagElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            // TODO - testaa että siirtyi eteenpäin
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
            const initialTitleContent = domUtils.getTagElementContent(this.rendered, 'h2');
            // Paina nappia
            const prevWeekButton = domUtils.findButtonByContent(this.rendered, '<');
            prevWeekButton.click();
            // Assertoi että pävittyi
            const titleContentAfter = domUtils.getTagElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            // TODO - testaa että siirtyi eteenpäin
        });
        QUnit.test('Toolbarin tänään-sivutuspainike vie takaisin nykyiselle viikolle', assert => {
            const initialTitleContent = domUtils.getTagElementContent(this.rendered, 'h2');
            // Mene pari sivullista eteenpäin
            const nextWeekButton = domUtils.findButtonByContent(this.rendered, '>');
            nextWeekButton.click();
            nextWeekButton.click();
            // Siirrä takaisin tälle viikolle
            const currentWeekButton = domUtils.findButtonByContent(this.rendered, 'Tänään');
            currentWeekButton.click();
            // Assertoi että palautui tälle viikolle
            const titleContentAfter = domUtils.getTagElementContent(this.rendered, 'h2');
            assert.equal(titleContentAfter, initialTitleContent);
        });
    });
});
