define(() => {
    'use strict';
    class ContentLayerFactory {
        constructor() {
            this.registrar = {};
        }
        /**
         * Rekisteröi sisältökerros-luokan {clazz} nimellä {name}, tai heittää
         * errorin jos {name} on jo rekisteröity.
         *
         * @access public
         * @param {string} name
         * @param {Function} clazz
         */
        register(name, clazz) {
            if (this.isRegistered(name)) {
                throw new Error(`Layer "${name}" on jo rekisteröity.`);
            }
            this.registrar[name] = clazz;
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
         * Palauttaa uuden instanssin sisältökerros-luokasta argumenteilla {...args},
         * joka löytyy rekisteristä nimellä {name}, tai heittää errorin mikäli
         * luokkaa ei ole rekisteröity.
         *
         * @access public
         * @param {string} name
         * @param {Array} args
         * @returns {Object} Uusi instanssi sisältölayerista {name}
         */
        make(name, args) {
            if (!this.isRegistered(name)) {
                throw new Error(`Layeria "${name}" ei ole rekisteröity.`);
            }
            return new this.registrar[name](...args);
        }
    }
    return {default: ContentLayerFactory};
});