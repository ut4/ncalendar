import ExtensionFactory from '../src/ExtensionFactory.js';
import TestExtension from './resources/TestExtension.js';

QUnit.module('ExtensionFactory', function (hooks) {
    hooks.beforeEach(() => {
        this.extensionFactory = new ExtensionFactory();
    });
    QUnit.test('.add validoi rekisteröitävän itemin', assert => {
        assert.throws(
            () => this.extensionFactory.add('foo', 'bar'),
            'Pitäisi heittää poikkeus, jos rekisteröitävä arvo ei funktio'
        );
        this.extensionFactory.add('foo', TestExtension);
        assert.throws(
            () => this.extensionFactory.add('foo', TestExtension),
            'Pitäisi heittää poikkeus, jos nimi on jo varattu'
        );
    });
    QUnit.test('.make osaa ottaa huomioon, onko rekisteröity itemi konstruktori vai factory', assert => {
        this.extensionFactory.add('constructable', TestExtension);
        this.extensionFactory.add('factory', (a, b) => new TestExtension(a, b, 'c'));
        this.extensionFactory.add('bogusFactory', () => 'fyt');
        //
        const args = [{settings: {}}, 'a'];
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
        assert.deepEqual(factoryResult.args, args.concat('c'),
            'Pitäisi luoda laajennos käyttäen factoryä'
        );
        assert.throws(
            () => this.extensionFactory.make('bogusFactory'),
            'Pitäisi heittää poikkeus, jos rekisteröidyn factory:n palauttama arvo ei ollut validi'
        );
    });
});
