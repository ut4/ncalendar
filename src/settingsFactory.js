import Constants from './Constants.js';
import { validPartNames } from './Toolbar.js';

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
function validateLayers(candidate) {
    if (!Array.isArray(candidate)) {
        return 'contentLayers-asetus tulisi olla taulukko';
    }
}
function validateToolbarParts(candidate) {
    if (typeof candidate !== 'string') {
        return 'toolbarParts-asetus tulisi olla merkkijono. esim \'prev,next|title|day,week\'';
    }
    for (const part of candidate.replace(/\|/g, ',').split(',')) {
        if (validPartNames.indexOf(part) < 0) {
            return 'titlePart "' + part + '" ei ole validi. Tuetut arvot: ' +
                validPartNames.join(',');
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
function validateLocale(candidate) {
    if (!Array.isArray(candidate) && typeof candidate !== 'string') {
        return 'locale-asetus tulisi olla merkkijono tai taulukko';
    }
}
/**
 * @param {any} value Asetuksen arvo
 * @param {Function} validator Arvon validoija
 * @param {any} defaultValue Oletusarvo asetukselle, jos value = undefined
 * @returns {any} Käyttäjän määrittelemä-, tai oletusarvo
 * @throws {Error}
 */
function getValidValue(value, validator, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }
    const error = validator(value) || null;
    if (error) {
        throw new Error(error);
    }
    return value;
}
const getValidViewName = value => getValidValue(value, validateViewKey, Constants.VIEW_DEFAULT);
/**
 * @param {Object} userSettings
 * @returns {Object} {
 *     defaultView: {string},
 *     defaultDate: {Date},
 *     contentLayers: {Array},
 *     toolbarParts: {string},
 *     titleFormatters: {Object},
 *     layoutChangeBreakPoint: {number},
 *     locale: {string|string[]}
 * }
 * @throws {Error}
 */
export default userSettings => ({
    defaultView: getValidViewName(userSettings.defaultView),
    defaultDate: getValidValue(userSettings.defaultDate, validateDefaultDate, new Date()),
    contentLayers: getValidValue(userSettings.contentLayers, validateLayers, []),
    toolbarParts: getValidValue(userSettings.toolbarParts, validateToolbarParts, 'prev,next,today|title|month,week,day'),
    titleFormatters: getValidValue(userSettings.titleFormatters, validateFormatters, {}),
    layoutChangeBreakPoint: getValidValue(userSettings.layoutChangeBreakPoint, validateBreakPoint, 800),
    locale: getValidValue(userSettings.locale, validateLocale, undefined)
});
export { getValidViewName };
