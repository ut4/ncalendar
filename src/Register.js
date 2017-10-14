/**
 * Geneerinen duplikaatiton kokoelma arvoja.
 *
 * @param {Object} register Objekti, jota mutatoidaan
 * @param {string} name Rekisterin nimi
 */
function Register(register, name = 'unnamed-register') {
    /**
     * @access public
     * @param {string} key
     * @param {any...} value
     * @throws {Error} Jos {key} on jo rekisteröity
     */
    this.add = function (key, value, ...rest) {
        if (this.has(key)) {
            throw new Error(`${name} "${key}" on jo rekisteröity.`);
        }
        register[key] = !this.transform ? value : this.transform(value, key, ...rest);
    };
    /**
     * @access public
     * @param {string} key
     * @returns {boolean}
     */
    this.has = function (key) {
        return register[key];
    };
    /**
     * @access public
     * @param {string} key
     * @returns {any} Rekisteröity arvo
     * @throws {Error} Jos arvoa avaimella {key} ei löytynyt
     */
    this.get = function (key) {
        if (!this.has(key)) {
            throw new Error(`${name}ta "${key}" ei ole rekisteröity.`);
        }
        return register[key];
    };
    /**
     * @access public
     * @param {Function} fn Funktio, jolle passataan rekisterin jokainen itemi.
     */
    this.traverse = function (fn) {
        for (const key in register) {
            fn(register[key], key);
        }
    };
}

const called = {};
/**
 * @param {string} key
 * @param {Function} fn
 */
const once = (key, fn) =>  {
    if (!called.hasOwnProperty(key)) {
        fn();
        called[key] = 1;
    }
};

export default Register;
export {once};
