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
                'Pitäisi heittää error'
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
                'Pitäisi heittää error'
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
                'Pitäisi heittää error'
            );
            assert.throws(
                () => {
                    settingsFactory.default({titleFormatters: {bogus: () => {}}});
                },
                'Pitäisi heittää error'
            );
        });
        QUnit.test('Asettaa layoutChangeBreakPoint:in', assert => {
            const input = {layoutChangeBreakPoint: 600};
            const settings = settingsFactory.default(input);
            assert.equal(settings.layoutChangeBreakPoint, input.layoutChangeBreakPoint);
        });
        QUnit.test('Validoi layoutChangeBreakPoint:in arvon', assert => {
            assert.throws(
                () => {
                    settingsFactory.default({layoutChangeBreakPoint: 'bogus'});
                },
                'Pitäisi heittää error'
            );
        });
        QUnit.test('Asettaa oletusarvot jos puuttuu inputista', assert => {
            const settings = settingsFactory.default({});
            assert.equal(settings.defaultView, Constants.VIEW_DEFAULT);
            assert.deepEqual(settings.contentLayers, []);
            assert.deepEqual(settings.titleFormatters, {});
            assert.deepEqual(settings.layoutChangeBreakPoint, undefined);
        });
    });
});
