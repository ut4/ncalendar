define(['src/Calendar', 'src/Constants'], (Calendar, Constants) => {
    'use strict';
    QUnit.module('CalendarClass', () => {
        QUnit.test('Rekisteröi props.settings.defaultView:in', assert => {
            const customSettings = {defaultView: Constants.VIEW_DAY};
            const instance = new Calendar.default({settings: customSettings});
            assert.equal(instance.settings.defaultView, customSettings.defaultView);
        });
        QUnit.test('Validoi props.settings.defaultView:in arvon', assert => {
            assert.throws(
                () => {
                    new Calendar.default({settings: {defaultView: 'bogus'}});
                },
                'Näkymää "bogus" ei löytynyt'
            );
        });
        QUnit.test('Rekisteröi props.settings.contentLayers:in', assert => {
            const customSettings = {contentLayers: ['foo']};
            const instance = new Calendar.default({settings: customSettings});
            assert.equal(instance.settings.contentLayers, customSettings.contentLayers);
        });
        QUnit.test('Validoi props.settings.contentLayers:in arvon', assert => {
            assert.throws(
                () => {
                    new Calendar.default({settings: {contentLayers: 'shh'}});
                },
                'contentLayers pitäisi olla taulukko'
            );
        });
        QUnit.test('Rekisteröi props.settings.titleFormatters:in', assert => {
            const customSettings = {titleFormatters: {[Constants.VIEW_DAY]: () => {}}};
            const instance = new Calendar.default({settings: customSettings});
            assert.equal(instance.settings.titleFormatters, customSettings.titleFormatters);
        });
        QUnit.test('Validoi props.settings.titleFormatters:in arvon', assert => {
            assert.throws(
                () => {
                    new Calendar.default({settings: {titleFormatters: {[Constants.VIEW_DAY]: 'bogus'}}});
                },
                'titleFormatters[' + Constants.VIEW_DAY + '] pitäisi olla funktio'
            );
            assert.throws(
                () => {
                    new Calendar.default({settings: {titleFormatters: {bogus: () => {}}}});
                },
                '"bogus" ei ole validi näkymä'
            );
        });
        QUnit.test('Asettaa oletusarvot jos props.settings puuttuu', assert => {
            const instance = new Calendar.default({});
            assert.equal(instance instanceof Calendar.default, true);
            assert.equal(instance.settings.defaultView, Constants.VIEW_DEFAULT);
            assert.deepEqual(instance.settings.contentLayers, []);
            assert.deepEqual(instance.settings.titleFormatters, {});
        });
    });
});
