define(['src/ContentLayerFactory', 'test/resources/TestContentLayer'], (ContentLayerFactory, TestContentLayer) => {
    'use strict';
    QUnit.module('ContentLayerFactory', hooks => {
        hooks.beforeEach(() => {
            this.contentLayerFactory = new ContentLayerFactory.default();
        });
        QUnit.test('.register validoi rekisteröitävän itemin', assert => {
            assert.throws(
                () => this.contentLayerFactory.register('foo', 'bar'),
                'Pitäisi heittää poikkeus, jos rekisteröitävä arvo ei funktio'
            );
            this.contentLayerFactory.register('foo', TestContentLayer.default);
            assert.throws(
                () => this.contentLayerFactory.register('foo', TestContentLayer.default),
                'Pitäisi heittää poikkeus, jos nimi on jo varattu'
            );
        });
        QUnit.test('.make osaa ottaa huomioon, onko rekisteröity itemi konstruktori vai factory', assert => {
            this.contentLayerFactory.register('constructable', TestContentLayer.default);
            this.contentLayerFactory.register('factory', (a, b) => new TestContentLayer.default('a', a, b));
            this.contentLayerFactory.register('bogusFactory', () => 'fyt');
            //
            const args = ['a', 'b'];
            const constructableResult = this.contentLayerFactory.make('constructable', args);
            const factoryResult = this.contentLayerFactory.make('factory', args);
            //
            assert.ok(constructableResult instanceof TestContentLayer.default,
                'Pitäisi palauttaa sisältökerros'
            );
            assert.ok(factoryResult instanceof TestContentLayer.default,
                'Pitäisi palauttaa sisältökerros'
            );
            assert.deepEqual(constructableResult.args, args,
                'Pitäisi luoda uusi sisältökerros käyttäen new-keywordia'
            );
            assert.deepEqual(factoryResult.args, ['a', ...args],
                'Pitäisi luoda sisältökerros käyttäen factoryä'
            );
            assert.throws(
                () => this.contentLayerFactory.make('bogusFactory'),
                'Pitäisi heittää poikkeus, jos rekisteröidyn factory:n palauttama arvo ei ollut validi'
            );
        });
    });
});
