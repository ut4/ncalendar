/**
 * Jokaiselle ContentLayerFactory-instanssille yhteinen, staattinen säilytystila
 * rekisteröidyille sisältökerroksille.
 *
 * @var {Object}
 */
const register = {};

class ContentLayerFactory {
    /**
     * Rekisteröi sisältökerroksen {ConstructorOrFactory} nimellä {name},
     * tai heittää poikkeuksen jos {name} on jo rekisteröity.
     *
     * @access public
     * @param {string} name
     * @param {Function} constructorOrFactory
     */
    register(name, constructorOrFactory) {
        if (this.isRegistered(name)) {
            throw new Error(`Layer "${name}" on jo rekisteröity.`);
        }
        if (typeof constructorOrFactory !== 'function') {
            throw new Error('Rekisteröitävä itemi tulisi olla luokka, tai funktio.');
        }
        register[name] = constructorOrFactory;
    }
    /**
     * Palauttaa tiedon löytyykö rekisteristä sisältökerros nimeltä {name}.
     *
     * @access public
     * @param {string} name
     * @returns {boolean}
     */
    isRegistered(name) {
        return register.hasOwnProperty(name);
    }
    /**
     * Luo uuden sisältökerroksen käyttäen rekisteröityä konstruktoria tai
     * factoryä {layer|layer.name}, tai heittää poikkeuksen mikäli rekisteröityä
     * itemiä ei löytynyt, tai se oli virheellinen.
     *
     * @access public
     * @param {string|Object} layer
     * @param {Array} args
     * @returns {Object} Uusi instanssi sisältölayerista {layer|layer.name}
     */
    make(layer, args) {
        if (typeof layer !== 'string') {
            layer.args && (args = layer.args(...args));
            layer = layer.name || '';
        }
        const item = register[layer];
        if (!item) {
            throw new Error(`Layeria "${layer}" ei ole rekisteröity.`);
        }
        if (!isValidContentLayer(item.prototype)) {
            const providedLayer = item(...args);
            if (!isValidContentLayer(providedLayer)) {
                throw new Error('Sisältökerros-factory:n palauttama instanssi ' +
                    ' tulisi implementoida metodit "load", ja "decorateCell"');
            }
            return providedLayer;
        } else {
            return new item(...args);
        }
    }
}

function isValidContentLayer(obj) {
    return obj && typeof obj.load === 'function' && typeof obj.decorateCell === 'function';
}

export default ContentLayerFactory;
