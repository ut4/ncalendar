define(['src/Constants'], (Constants) => {
    'use strict';
    /**
     * Palauttaa validin näkymän nimen, tai heittää errorin jos sitä ei löytynyt
     * Constants-objektista (VIEW_{viewNameKeyIsoillaKirjaimilla}).
     *
     * @param {String} viewNameKey
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
     * Palattaa validin contentLayers-arvon, tai heittää errorin jos {candidate}
     * ei ollut validi.
     *
     * @param {Array} candidate
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
     * Palauttaa validin titleFormatters-, tai tyhjän objektin, tai heittää
     * errorin jos jokin {candidaten} arvoista ei ollut validi.
     *
     * @param {Object} candidate {
     *     [Constants.VIEW_DAY]: {Function},
     *     [Constants.VIEW_WEEK]: {Function},
     *     [Constants.VIEW_MONTH]: {Function}
     * }
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
    return {
        /**
         * Palauttaa validin settings-objektin, tai heittää errorin jos jokin
         * {userSettings}in arvo ei ollut validi.
         *
         * @param {Object=} userSettings
         * @returns {Object} {
         *     defaultView: {string=},
         *     contentLayers: {Array=},
         *     titleFormatters: {Object=}
         * }
         */
        default: function (userSettings) {
            return {
                defaultView: getValidViewName(userSettings.defaultView || 'default'),
                contentLayers: getValidContentLayers(userSettings.contentLayers),
                titleFormatters: getValidTitleFormatters(userSettings.titleFormatters)
            };
        },
        getValidViewName
    };
});