define(['src/settingsFactory', 'src/Constants'], (settingsFactory, Constants) => {
    'use strict';
    QUnit.module('settingsFactory', () => {
        QUnit.test('Asettaa defaultView:in', assert => {
            const input = {defaultView: Constants.VIEW_DAY};
            const settings = settingsFactory.default(input);
            assert.equal(settings.defaultView, input.defaultView);
        });
        QUnit.test('Validoi defaultView:in arvon', assert => {
            assert.throws(
                () => {
                    settingsFactory.default({defaultView: 'bogus'});
                },
                'Näkymää "bogus" ei löytynyt'
            );
        });
        QUnit.test('Asettaa contentLayers:in', assert => {
            const input = {contentLayers: ['foo']};
            const settings = settingsFactory.default(input);
            assert.equal(settings.contentLayers, input.contentLayers);
        });
        QUnit.test('Validoi contentLayers:in arvon', assert => {
            assert.throws(
                () => {
                    settingsFactory.default({contentLayers: 'shh'});
                },
                'contentLayers pitäisi olla taulukko'
            );
        });
        QUnit.test('Asettaa titleFormatters:in', assert => {
            const input = {titleFormatters: {[Constants.VIEW_DAY]: () => {}}};
            const settings = settingsFactory.default(input);
            assert.equal(settings.titleFormatters, input.titleFormatters);
        });
        QUnit.test('Validoi titleFormatters:in arvon', assert => {
            assert.throws(
                () => {
                    settingsFactory.default({titleFormatters: {[Constants.VIEW_DAY]: 'bogus'}});
                },
                'titleFormatters[' + Constants.VIEW_DAY + '] pitäisi olla funktio'
            );
            assert.throws(
                () => {
                    settingsFactory.default({titleFormatters: {bogus: () => {}}});
                },
                '"bogus" ei ole validi näkymä'
            );
        });
        QUnit.test('Asettaa oletusarvot jos puuttuu inputista', assert => {
            const settings = settingsFactory.default({});
            assert.equal(settings.defaultView, Constants.VIEW_DEFAULT);
            assert.deepEqual(settings.contentLayers, []);
            assert.deepEqual(settings.titleFormatters, {});
        });
    });
});
