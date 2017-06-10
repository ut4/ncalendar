define(['src/Calendar', 'src/Constants', 'test/resources/Utils'], (Calendar, Constants, Utils) => {
    'use strict';
    const domUtils = Utils.domUtils;
    QUnit.module('CalendarComponent(month)', hooks => {
        hooks.beforeEach(() => {
            this.rendered = Inferno.TestUtils.renderIntoDocument($el(Calendar.default, {initialView: Constants.VIEW_MONTH}));
        });
        QUnit.test('Toolbarin next-sivutuspainike päivittää titlen', assert => {
            const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
            // Paina nappia
            const nextMonthButton = domUtils.findButtonByContent(this.rendered, '>');
            nextMonthButton.click();
            // Assertoi että päivittyi
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            // TODO - testaa että siirtyi eteenpäin
        });
        QUnit.test('Toolbarin prev-sivutuspainike päivittää titlen', assert => {
            const initialTitleContent = domUtils.getElementContent(this.rendered, 'h2');
            // Paina nappia
            const prevMonthButton = domUtils.findButtonByContent(this.rendered, '<');
            prevMonthButton.click();
            // Assertoi että pävittyi
            const titleContentAfter = domUtils.getElementContent(this.rendered, 'h2');
            assert.notEqual(titleContentAfter, initialTitleContent);
            // TODO - testaa että siirtyi eteenpäin
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
