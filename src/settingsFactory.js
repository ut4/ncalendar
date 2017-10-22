import Register, {once} from './Register.js';
import ExtensionFactory from './ExtensionFactory.js';
import Constants from './Constants.js';

function validateViewKey(viewNameKey) {
    const lookedUpViewName = Constants['VIEW_' + viewNameKey.toUpperCase()];
    if (!lookedUpViewName) {
        return 'Näkymää "' + viewNameKey + '" ei löytynyt';
    }
}
function validateDefaultDate(candidate) {
    if (!(candidate instanceof Date)) {
        return 'defaultDate-asetus tulisi olla Date-instanssi';
    }
}
function validateExtensions(candidate) {
    if (!Array.isArray(candidate)) {
        return 'extensions-asetus tulisi olla taulukko';
    }
}
function validateToolbarParts(candidate) {
    if (typeof candidate !== 'string') {
        return 'toolbarParts-asetus tulisi olla merkkijono. esim \'prev,next|title|day,week\'';
    }
    for (const part of candidate.replace(/\|/g, ',').split(',')) {
        if (!part.length) {
            return 'Toolbarpart-osa ei voi olla tyhjä';
        }
    }
}
function validateFormatters(candidate) {
    for (const viewNameKey in candidate) {
        if (typeof candidate[viewNameKey] !== 'function') {
            return 'titleFormatters[' + viewNameKey + '] pitäisi olla funktio';
        }
        const hintForBadViewName = validateViewKey(viewNameKey);
        if (hintForBadViewName) {
            return hintForBadViewName;
        }
    }
}
function validateBreakPoint(candidate) {
    if (!Number.isInteger(candidate)) {
        return 'layoutChangeBreakPoint-asetus tulisi olla kokonaisluku';
    }
}
function validateHours(candidate) {
    if (typeof candidate !== 'object' ||
        typeof candidate.first !== 'number' ||
        typeof candidate.last !== 'number') {
        return 'hours-asetus tulisi olla objekti, esim. {first: 8, last: 16}';
    }
    if (candidate.first >= candidate.last) {
        return 'hours.first tulisi olla vähemmän kuin hours.last';
    }
    if (candidate.last > 23) {
        return 'hours.last tulisi olla vähemmän kuin 24';
    }
}
function validateLocale(candidate) {
    if (!Array.isArray(candidate) && typeof candidate !== 'string') {
        return 'locale-asetus tulisi olla merkkijono tai taulukko';
    }
}
function validateFirstDayOfWeek(candidate) {
    if (typeof candidate !== 'number' || candidate < 0 || candidate > 6) {
        return 'firstDayOfWeek tulisi olla numero 0-6';
    }
}
/**
 * @param {any} value Asetuksen arvo
 * @param {Function} validator Arvon validoija
 * @param {any} defaultValue Oletusarvo asetukselle, jos value = undefined
 * @param {string=} key Aetuksen nimi
 * @returns {any} Käyttäjän määrittelemä-, tai oletusarvo
 * @throws {Error} Jos {validator} palautti merkkijonon
 */
function getValidValue(value, validator, defaultValue, key) {
    if (value === undefined) {
        return defaultValue;
    }
    const error = validator(value) || null;
    if (typeof error === 'string') {
        throw new Error(!key ? error : error.replace(/%s/g, key));
    }
    return value;
}
const getValidViewName = value => getValidValue(value, validateViewKey, Constants.VIEW_DEFAULT);

/*
 * Jokaiselle kalenterille yhteinen asetus-avain/validaattorirekisteri.
 */
const knownSettings = {
    defaultView: {validator: validateViewKey, defaultValue: Constants.VIEW_DEFAULT},
    defaultDate: {validator: validateDefaultDate, defaultValue: new Date()},
    toolbarParts: {validator: validateToolbarParts, defaultValue: 'prev,next,today|title|month,week,day'},
    titleFormatters: {validator: validateFormatters, defaultValue: {}},
    layoutChangeBreakPoint: {validator: validateBreakPoint, defaultValue: 800},
    hours: {validator: validateHours, defaultValue: {first: 6, last: 17}},
    locale: {validator: validateLocale, defaultValue: undefined},
    firstDayOfWeek: {validator: validateFirstDayOfWeek, defaultValue: 1}
};
const settingsRegister = {
    transform(validator, key, defaultValue) {
        return {validator, defaultValue};
    }
};
Object.assign(settingsRegister, new Register(knownSettings, 'asetus'));

/*
 * Jokaiselle kalenterille yhteinen asetusFactory.
 */
const extensionFactory = new ExtensionFactory();
const settingsFactory = {
    /**
     * @param {Object} userSettings
     * @returns {Object} {
     *     defaultView: {string},
     *     defaultDate: {Date},
     *     extensions: {Array},
     *     toolbarParts: {string},
     *     titleFormatters: {Object},
     *     layoutChangeBreakPoint: {number},
     *     hours: {Object},
     *     locale: {string|string[]},
     *     firstDayOfWeek: {number}
     * }
     */
    makeSettings(userSettings) {
        // 1. Lisää laajennoksien rekisteröimät asetusavain/validaattorit.
        const selectedExtensionNames = getValidValue(userSettings.extensions, validateExtensions, []);
        selectedExtensionNames.forEach(name => {
            once('defineSettings#' + name, () => {
                // Staattinen metodi "defineSettings" on laajennoksille vapaaehtoinen.
                const definer = extensionFactory.get(name).defineSettings;
                if (typeof definer === 'function') {
                    definer(settingsRegister);
                }
            });
        });
        // 2. Validoi, ja luo asetukset
        const validSettings = {extensions: selectedExtensionNames};
        settingsRegister.traverse((def, key) => {
            validSettings[key] = getValidValue(
                userSettings[key],
                def.validator,
                def.defaultValue,
                key
            );
        });
        return validSettings;
    },
};

export default settingsFactory;
export {getValidViewName};
