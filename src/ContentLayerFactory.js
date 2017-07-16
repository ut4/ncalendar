define(() => {
    'use strict';
    class ContentLayerFactory {
        constructor() {
            this.registrar = {};
        }
        /**
         * Rekisteröi sisältökerroksen {ConstructorOrFactory} nimellä {name},
         * tai heittää poikkeuksen jos {name} on jo rekisteröity.
         *
         * @access public
         * @param {string} name
         * @param {Function} ConstructorOrFactory
         */
        register(name, ConstructorOrFactory) {
            if (this.isRegistered(name)) {
                throw new Error(`Layer "${name}" on jo rekisteröity.`);
            }
            if (typeof ConstructorOrFactory !== 'function') {
                throw new Error('Rekisteröitävä itemi tulisi olla luokka, tai funktio.');
            }
            this.registrar[name] = ConstructorOrFactory;
        }
        /**
         * Palauttaa tiedon löytyykö rekisteristä sisältökerros nimeltä {name}.
         *
         * @access public
         * @param {string} name
         * @returns {boolean}
         */
        isRegistered(name) {
            return this.registrar.hasOwnProperty(name);
        }
        /**
         * Luo uuden sisältökerroksen käyttäen rekisteröityä konstruktoria tai
         * factoryä {name}, tai heittää poikkeuksen mikäli rekisteröityä itemiä
         * ei löytynyt, tai se oli virheellinen.
         *
         * @access public
         * @param {string} name
         * @param {Array} args
         * @returns {Object} Uusi instanssi sisältölayerista {name}
         */
        make(name, args) {
            const item = this.registrar[name];
            if (!item) {
                throw new Error(`Layeria "${name}" ei ole rekisteröity.`);
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
    return {default: ContentLayerFactory};
});