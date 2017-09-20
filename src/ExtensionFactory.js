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
    make(extension, args) {
        if (typeof extension !== 'string') {
            extension.args && (args = extension.args(...args));
            extension = extension.name || '';
        }
        const item = register[extension];
        if (!item) {
            throw new Error(`Extensionia "${extension}" ei ole rekisteröity.`);
        }
        if (!isValidExtension(item.prototype)) {
            const providedExtension = item(...args);
            if (!isValidExtension(providedExtension)) {
                throw new Error('Laajennos-factory:n palauttama instanssi ' +
                    ' tulisi implementoida metodit "load", ja "decorateCell"');
            }
            return providedExtension;
        } else {
            return new item(...args);
        }
    }
}

function isValidExtension(obj) {
    return obj && typeof obj.load === 'function' && typeof obj.decorateCell === 'function';
}

export default ExtensionFactory;
