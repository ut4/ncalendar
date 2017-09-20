import ExtensionFactory from '../src/ExtensionFactory.js';
import TestExtension from './resources/TestExtension.js';

QUnit.module('ExtensionFactory', function (hooks) {
    hooks.beforeEach(() => {
        this.extensionFactory = new ExtensionFactory();
    });
    QUnit.test('.register validoi rekisteröitävän itemin', assert => {
        assert.throws(
            () => this.extensionFactory.register('foo', 'bar'),
            'Pitäisi heittää poikkeus, jos rekisteröitävä arvo ei funktio'
        );
        this.extensionFactory.register('foo', TestExtension);
        assert.throws(
            () => this.extensionFactory.register('foo', TestExtension),
            'Pitäisi heittää poikkeus, jos nimi on jo varattu'
        );
    });
    QUnit.test('.make osaa ottaa huomioon, onko rekisteröity itemi konstruktori vai factory', assert => {
        this.extensionFactory.register('constructable', TestExtension);
        this.extensionFactory.register('factory', (a, b) => new TestExtension('a', a, b));
        this.extensionFactory.register('bogusFactory', () => 'fyt');
        //
        const args = ['a', 'b'];
        const constructableResult = this.extensionFactory.make('constructable', args);
        const factoryResult = this.extensionFactory.make('factory', args);
        //
        assert.ok(constructableResult instanceof TestExtension,
            'Pitäisi palauttaa laajennos'
        );
        assert.ok(factoryResult instanceof TestExtension,
            'Pitäisi palauttaa laajennos'
        );
        assert.deepEqual(constructableResult.args, args,
            'Pitäisi luoda uusi laajennos käyttäen new-keywordia'
        );
        assert.deepEqual(factoryResult.args, ['a', ...args],
            'Pitäisi luoda laajennos käyttäen factoryä'
        );
        assert.throws(
            () => this.extensionFactory.make('bogusFactory'),
            'Pitäisi heittää poikkeus, jos rekisteröidyn factory:n palauttama arvo ei ollut validi'
        );
    });
    QUnit.test('.make handlaa myös object-notaation', assert => {
        this.extensionFactory.register('test1', TestExtension);
        this.extensionFactory.register('test2', function() { return new TestExtension('a', ...arguments); });
        //
        const defaultArgs1 = ['a', 'b'];
        const defaultArgs2 = ['c', 'd'];
        const customArgs1 = {foo: 'bar'};
        const customArgs2 = {baz: 'hax'};
        const result1 = this.extensionFactory.make({name: 'test1', args: (a, b) => [customArgs1, a, b]}, defaultArgs1);
        const result2 = this.extensionFactory.make({name: 'test2', args: (c, d) => [customArgs2, c, d]}, defaultArgs2);
        //
        assert.ok(result1 instanceof TestExtension,
            'Pitäisi luoda laajennos'
        );
        assert.ok(result2 instanceof TestExtension,
            'Pitäisi luoda laajennos'
        );
        assert.deepEqual(result1.args, [customArgs1, ...defaultArgs1],
            'Pitäisi passata konstruktorille custom-argumentit'
        );
        assert.deepEqual(result2.args, ['a', customArgs2, ...defaultArgs2],
            'Pitäisi passata factorylle custom-argumentit'
        );
    });
});
