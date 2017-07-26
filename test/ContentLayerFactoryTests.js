import ContentLayerFactory from '../src/ContentLayerFactory.js';
import TestContentLayer from './resources/TestContentLayer.js';

QUnit.module('ContentLayerFactory', function (hooks) {
    hooks.beforeEach(() => {
        this.contentLayerFactory = new ContentLayerFactory();
    });
    QUnit.test('.register validoi rekisteröitävän itemin', assert => {
        assert.throws(
            () => this.contentLayerFactory.register('foo', 'bar'),
            'Pitäisi heittää poikkeus, jos rekisteröitävä arvo ei funktio'
        );
        this.contentLayerFactory.register('foo', TestContentLayer);
        assert.throws(
            () => this.contentLayerFactory.register('foo', TestContentLayer),
            'Pitäisi heittää poikkeus, jos nimi on jo varattu'
        );
    });
    QUnit.test('.make osaa ottaa huomioon, onko rekisteröity itemi konstruktori vai factory', assert => {
        this.contentLayerFactory.register('constructable', TestContentLayer);
        this.contentLayerFactory.register('factory', (a, b) => new TestContentLayer('a', a, b));
        this.contentLayerFactory.register('bogusFactory', () => 'fyt');
        //
        const args = ['a', 'b'];
        const constructableResult = this.contentLayerFactory.make('constructable', args);
        const factoryResult = this.contentLayerFactory.make('factory', args);
        //
        assert.ok(constructableResult instanceof TestContentLayer,
            'Pitäisi palauttaa sisältökerros'
        );
        assert.ok(factoryResult instanceof TestContentLayer,
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
    QUnit.test('.make handlaa myös object-notaation', assert => {
        this.contentLayerFactory.register('test1', TestContentLayer);
        this.contentLayerFactory.register('test2', function() { return new TestContentLayer('a', ...arguments); });
        //
        const defaultArgs1 = ['a', 'b'];
        const defaultArgs2 = ['c', 'd'];
        const customArgs1 = {foo: 'bar'};
        const customArgs2 = {baz: 'hax'};
        const result1 = this.contentLayerFactory.make({name: 'test1', args: (a, b) => [customArgs1, a, b]}, defaultArgs1);
        const result2 = this.contentLayerFactory.make({name: 'test2', args: (c, d) => [customArgs2, c, d]}, defaultArgs2);
        //
        assert.ok(result1 instanceof TestContentLayer,
            'Pitäisi luoda sisältökerros'
        );
        assert.ok(result2 instanceof TestContentLayer,
            'Pitäisi luoda sisältökerros'
        );
        assert.deepEqual(result1.args, [customArgs1, ...defaultArgs1],
            'Pitäisi passata konstruktorille custom-argumentit'
        );
        assert.deepEqual(result2.args, ['a', customArgs2, ...defaultArgs2],
            'Pitäisi passata factorylle custom-argumentit'
        );
    });
});
