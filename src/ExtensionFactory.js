import Register from './Register.js';

/**
 * Jokaiselle ExtensionFactory-instanssille yhteinen, staattinen säilytystila
 * rekisteröidyille laajennoksille.
 *
 * @var {Object}
 */
const register = {};

class ExtensionFactory {
    constructor() {
        Object.assign(this, new Register(register, 'laajennos'));
    }
    /**
     * Luo uuden laajennoksen käyttäen rekisteröityä konstruktoria, tai heittää
     * poikkeuksen mikäli rekisteröityä itemiä ei löytynyt, tai se oli virheellinen.
     *
     * @access public
     * @param {string} name
     * @param {Array} args
     * @returns {Object} Uusi instanssi laajennoksesta {name}
     */
    make(name, args) {
        const registered = this.get(name);
        // Konstruktori
        if (isValidExtension(registered.prototype)) {
            return new registered(...args);
        // Factory-funktio
        } else {
            const out = registered(...args);
            if (!isValidExtension(out)) {
                throw new Error('Laajennos-factory:n palauttama instanssi ' +
                    ' tulisi implementoida metodit "load", "decorateCell", ' +
                    'ja "addToolbarPartFactories"');
            }
            return out;
        }
    }
    /**
     * Triggeröityy aina, kun kutsutaan extensionFactory.add(extension);
     *
     * @access protected
     */
    transform(extension) {
        if (typeof extension !== 'function') {
            throw new Error('Rekisteröitävä laajennos tulisi olla konstruktori.');
        }
        return extension;
    }
}

function isValidExtension(obj) {
    return obj &&
        typeof obj.load === 'function' &&
        typeof obj.decorateCell === 'function' &&
        typeof obj.addToolbarPartFactories === 'function';
}

export default ExtensionFactory;
