define(['src/Constants'], (Constants) => {
    'use strict';
    /**
     * @param {string} viewNameKey
     * @returns {string}
     * @throws {Error}
     */
    function getValidViewName(viewNameKey) {
        const lookedUpViewName = Constants['VIEW_' + viewNameKey.toUpperCase()];
        if (!lookedUpViewName) {
            throw new Error('Näkymää "' + viewNameKey + '" ei löytynyt');
        }
        return lookedUpViewName;
    }
    /**
     * @param {Date=} candidate
     * @returns {Date}
     * @throws {Error}
     */
    function getValidDefaultDate(candidate) {
        if (!candidate) {
            return new Date();
        }
        if (!(candidate instanceof Date)) {
            throw new Error('defaultDate pitäisi olla Date-instanssi');
        }
        return candidate;
    }
    /**
     * @param {Array=} candidate
     * @returns {Array}
     * @throws {Error}
     */
    function getValidContentLayers(candidate) {
        if (!candidate) {
            return [];
        }
        if (!Array.isArray(candidate)) {
            throw new Error('contentLayers pitäisi olla taulukko');
        }
        return candidate;
    }
    /**
     * @param {Object=} candidate
     * @returns {Object}
     * @throws {Error}
     */
    function getValidTitleFormatters(candidate) {
        if (!candidate) {
            return {};
        }
        for (const viewNameKey in candidate) {
            if (typeof candidate[viewNameKey] !== 'function') {
                throw new Error('titleFormatters[' + viewNameKey + '] pitäisi olla funktio');
            }
            if (viewNameKey !== Constants.VIEW_DAY &&
                viewNameKey !== Constants.VIEW_WEEK &&
                viewNameKey !== Constants.VIEW_MONTH) {
                throw new Error('"' + viewNameKey + '" ei ole validi näkymä');
            }
        }
        return candidate;
    }
    /**
     * @param {number=} candidate
     * @returns {number}
     * @throws {Error}
     */
    function getValidLayoutChangeBreakPoint(candidate) {
        if (candidate === undefined) {
            return 800;
        }
        if (!Number.isInteger(candidate)) {
            throw new Error('layoutChangeBreakPoint pitäisi olla kokonaisluku');
        }
        return candidate;
    }
    return {
        /**
         * Palauttaa settings-objektin, tai heittää poikkeuksen jos jokin käyttäjän
         * määrittelemistä arvoista ei ollut validi.
         *
         * @param {Object} userSettings
         * @returns {Object} {
         *     defaultView: {string},
         *     defaultDate: {Date},
         *     contentLayers: {Array},
         *     titleFormatters: {Object},
         *     layoutChangeBreakPoint: {number}
         * }
         */
        default: function (userSettings) {
            return {
                defaultView: getValidViewName(userSettings.defaultView || 'default'),
                defaultDate: getValidDefaultDate(userSettings.defaultDate),
                contentLayers: getValidContentLayers(userSettings.contentLayers),
                titleFormatters: getValidTitleFormatters(userSettings.titleFormatters),
                layoutChangeBreakPoint: getValidLayoutChangeBreakPoint(userSettings.layoutChangeBreakPoint)
            };
        },
        getValidViewName
    };
});