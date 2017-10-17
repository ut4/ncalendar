import settingsFactory from '../src/settingsFactory.js';
import Constants from '../src/Constants.js';

QUnit.module('settingsFactory', function() {
    QUnit.test('Asettaa arvot', assert => {
        [
            ['defaultView', Constants.VIEW_DAY],
            ['defaultDate', new Date(2015, 3, 16)],
            ['toolbarParts', 'title|prev,next'],
            ['titleFormatters', {[Constants.VIEW_DAY]: () => {}}],
            ['layoutChangeBreakPoint', 600],
            ['hours', {first: 8, last: 17}],
            ['locale', 'en-US']
        ].forEach(([setting, value]) => {
            const input = {[setting]: value};
            const settings = settingsFactory.makeSettings(input);
            assert.deepEqual(settings[setting], input[setting], `Pitäisi asettaa ${setting}:n arvo`);
        });
    });
    QUnit.test('Validoi arvot', assert => {
        [
            {defaultView: 'bogus'},
            {defaultDate: 'bogus'},
            {extensions: 'shh'},
            {toolbarParts: /bogus/},
            {toolbarParts: 'title,,'},
            {titleFormatters: {[Constants.VIEW_DAY]: 'bogus'}},
            {titleFormatters: {bogus: () => {}}},
            {layoutChangeBreakPoint: 'bogus'},
            {hours: 'bogus'},
            {hours: {first: 1}},
            {hours: {first: 6, last: 2}},
            {hours: {first: 6, last: 24}},
            {locale: /fus/}
        ].forEach(value => {
            assert.throws(
                () => { settingsFactory.makeSettings(value); },
                `Pitäisi heittää error asetukselle: ${JSON.stringify(value)}`
            );
        });
    });
    QUnit.test('Asettaa oletusarvot määrittelemättömille asetuksille, ja ignorettaa tuntemattomat', assert => {
        const now = new Date();
        const settings = settingsFactory.makeSettings({foo: 'bar'});
        assert.equal(settings.defaultView, Constants.VIEW_DEFAULT);
        assert.equal(settings.defaultDate.toDateString(), now.toDateString());
        assert.deepEqual(settings.extensions, []);
        assert.deepEqual(settings.toolbarParts, 'prev,next,today|title|month,week,day');
        assert.deepEqual(settings.titleFormatters, {});
        assert.deepEqual(settings.layoutChangeBreakPoint, 800);
        assert.deepEqual(settings.hours, {first: 6, last: 17});
        assert.deepEqual(settings.locale, undefined);
        assert.equal(settings.hasOwnProperty('foo'), false,
            'Pitäisi ignorettaa tuntemattomat asetukset'
        );
    });
});
