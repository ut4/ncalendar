/**
 * Jokaiselle ExtensionFactory-instanssille yhteinen, staattinen säilytystila
 * rekisteröidyille laajennoksille.
 *
 * @var {Object}
 */
const register = {};

class ExtensionFactory {
    /**
     * Rekisteröi laajennoksen {constructorOrFactory} nimellä {name},
     * tai heittää poikkeuksen jos {name} on jo rekisteröity.
     *
     * @access public
     * @param {string} name
     * @param {Function} constructorOrFactory
     */
    register(name, constructorOrFactory) {
        if (this.isRegistered(name)) {
            throw new Error(`Extension "${name}" on jo rekisteröity.`);
        }
        if (typeof constructorOrFactory !== 'function') {
            throw new Error('Rekisteröitävä itemi tulisi olla luokka, tai funktio.');
        }
        register[name] = constructorOrFactory;
    }
    /**
     * Palauttaa tiedon löytyykö rekisteristä laajennos nimeltä {name}.
     *
     * @access public
     * @param {string} name
     * @returns {boolean}
     */
    isRegistered(name) {
        return register.hasOwnProperty(name);
    }
    /**
     * Luo uuden laajennoksen käyttäen rekisteröityä konstruktoria tai
     * factoryä {extension|extension.name}, tai heittää poikkeuksen mikäli
     * rekisteröityä itemiä ei löytynyt, tai se oli virheellinen.
     *
     * @access public
     * @param {string|Object} extension
     * @param {Array} args
     * @returns {Object} Uusi instanssi laajennoksesta {extension|extension.name}
     */
    make(key, args) {
        const name = key.name || key;
        const setupFn = key.setup || null;
        const registered = register[name];
        let out;
        if (!registered) {
            throw new Error(`Extensionia "${name}" ei ole rekisteröity.`);
        }
        // Konstruktori
        if (isValidExtension(registered.prototype)) {
            out = new registered(...args);
        // Factory-funktio
        } else {
            out = registered(...args);
            if (!isValidExtension(out)) {
                throw new Error('Laajennos-factory:n palauttama instanssi ' +
                    ' tulisi implementoida metodit "load", ja "decorateCell"');
            }
        }
        setupFn && setupFn(out);
        return out;
    }
}

function isValidExtension(obj) {
    return obj && typeof obj.load === 'function' && typeof obj.decorateCell === 'function';
}

export default ExtensionFactory;
