import settingsFactory from '../src/settingsFactory.js';
import Constants from '../src/Constants.js';

QUnit.module('settingsFactory', function() {
    QUnit.test('Asettaa defaultView:in', assert => {
        const input = {defaultView: Constants.VIEW_DAY};
        const settings = settingsFactory(input);
        assert.equal(settings.defaultView, input.defaultView);
    });
    QUnit.test('Validoi defaultView:in arvon', assert => {
        assert.throws(
            () => {
                settingsFactory({defaultView: 'bogus'});
            },
            'Pitäisi heittää error'
        );
    });
    QUnit.test('Asettaa defaultDate:n', assert => {
        const input = {defaultDate: new Date(2015, 3, 16)};
        const settings = settingsFactory(input);
        assert.equal(settings.defaultDate, input.defaultDate);
    });
    QUnit.test('Validoi defaultDate:n arvon', assert => {
        assert.throws(
            () => {
                settingsFactory({defaultDate: 'bogus'});
            },
            'Pitäisi heittää error'
        );
    });
    QUnit.test('Asettaa contentLayers:in', assert => {
        const input = {contentLayers: ['foo']};
        const settings = settingsFactory(input);
        assert.equal(settings.contentLayers, input.contentLayers);
    });
    QUnit.test('Validoi contentLayers:in arvon', assert => {
        assert.throws(
            () => {
                settingsFactory({contentLayers: 'shh'});
            },
            'Pitäisi heittää error'
        );
    });
    QUnit.test('Asettaa titleFormatters:in', assert => {
        const input = {titleFormatters: {[Constants.VIEW_DAY]: () => {}}};
        const settings = settingsFactory(input);
        assert.equal(settings.titleFormatters, input.titleFormatters);
    });
    QUnit.test('Validoi titleFormatters:in arvon', assert => {
        assert.throws(
            () => {
                settingsFactory({titleFormatters: {[Constants.VIEW_DAY]: 'bogus'}});
            },
            'Pitäisi heittää error'
        );
        assert.throws(
            () => {
                settingsFactory({titleFormatters: {bogus: () => {}}});
            },
            'Pitäisi heittää error'
        );
    });
    QUnit.test('Asettaa layoutChangeBreakPoint:in', assert => {
        const input = {layoutChangeBreakPoint: 600};
        const settings = settingsFactory(input);
        assert.equal(settings.layoutChangeBreakPoint, input.layoutChangeBreakPoint);
    });
    QUnit.test('Validoi layoutChangeBreakPoint:in arvon', assert => {
        assert.throws(
            () => {
                settingsFactory({layoutChangeBreakPoint: 'bogus'});
            },
            'Pitäisi heittää error'
        );
    });
    QUnit.test('Asettaa oletusarvot määrittelemättömille asetuksille, ja ignorettaa tuntemattomat', assert => {
        const now = new Date();
        const settings = settingsFactory({foo: 'bar'});
        assert.equal(settings.defaultView, Constants.VIEW_DEFAULT);
        assert.equal(settings.defaultDate.toGMTString(), now.toGMTString());
        assert.deepEqual(settings.contentLayers, []);
        assert.deepEqual(settings.titleFormatters, {});
        assert.deepEqual(settings.layoutChangeBreakPoint, 800);
        assert.equal(settings.hasOwnProperty('foo'), false,
            'Pitäisi ignorettaa tuntemattomat asetukset'
        );
    });
});
