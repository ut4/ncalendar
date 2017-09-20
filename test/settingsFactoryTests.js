import settingsFactory from '../src/settingsFactory.js';
import Constants from '../src/Constants.js';

QUnit.module('settingsFactory', function() {
    QUnit.test('Asettaa arvot', assert => {
        [
            ['defaultView', Constants.VIEW_DAY],
            ['defaultDate', new Date(2015, 3, 16)],
            ['extensions', ['foo']],
            ['toolbarParts', 'title|prev,next'],
            ['titleFormatters', {[Constants.VIEW_DAY]: () => {}}],
            ['layoutChangeBreakPoint', 600],
            ['locale', 'en-US']
        ].forEach(([setting, value]) => {
            const input = {[setting]: value};
            const settings = settingsFactory(input);
            assert.deepEqual(settings[setting], input[setting], `Pitäisi asettaa ${setting}:n arvo`);
        });
    });
    QUnit.test('Validoi arvot', assert => {
        [
            {defaultView: 'bogus'},
            {defaultDate: 'bogus'},
            {extensions: 'shh'},
            {toolbarParts: /bogus/},
            {toolbarParts: 'title,bogus'},
            {toolbarParts: 'title,,'},
            {titleFormatters: {[Constants.VIEW_DAY]: 'bogus'}},
            {titleFormatters: {bogus: () => {}}},
            {layoutChangeBreakPoint: 'bogus'},
            {locale: /fus/}
        ].forEach(value => {
            assert.throws(
                () => { settingsFactory(value); },
                `Pitäisi heittää error asetukselle: ${JSON.stringify(value)}`
            );
        });
    });
    QUnit.test('Asettaa oletusarvot määrittelemättömille asetuksille, ja ignorettaa tuntemattomat', assert => {
        const now = new Date();
        const settings = settingsFactory({foo: 'bar'});
        assert.equal(settings.defaultView, Constants.VIEW_DEFAULT);
        assert.equal(settings.defaultDate.toGMTString(), now.toGMTString());
        assert.deepEqual(settings.extensions, []);
        assert.deepEqual(settings.toolbarParts, 'prev,next,today|title|month,week,day');
        assert.deepEqual(settings.titleFormatters, {});
        assert.deepEqual(settings.layoutChangeBreakPoint, 800);
        assert.deepEqual(settings.locale, undefined);
        assert.equal(settings.hasOwnProperty('foo'), false,
            'Pitäisi ignorettaa tuntemattomat asetukset'
        );
    });
});
