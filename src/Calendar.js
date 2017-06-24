define(['src/Layout', 'src/Constants', 'src/DateCursors'], (Layout, Constants, DateCursors) => {
    'use strict';
    /*
     * Kalenterin juurikomponentti, ja kirjaston public API.
     */
    class Calendar extends Inferno.Component {
        /**
         * @param {Object} props {
         *     settings: {
         *         defaultView: {string},
         *         titleFormatters: {Object},
         *         contentLayers: {Array}
         *     }=
         * }
         */
        constructor(props) {
            super(props);
            this.settingsi = makeSettings(props.settings || {});
            this.state = {
                currentView: this.settingsi.defaultView,
                dateCursor: this.makeDateCursor(this.settingsi.defaultView)
            };
        }
        /**
         * Asettaa staten {state.currentView}:in arvoksi {to} (mikäli se ei ole
         * jo valmiiksi), ja alustaa uuden kursorin {state.dateCursor}:iin (mi-
         * käli näkymä vaihtui).
         *
         * @access public
         * @param {string} to Constants.VIEW_DAY | Constants.VIEW_WEEK | Constants.VIEW_MONTH
         */
        changeView(to) {
            const newView = getValidViewName(to);
            if (this.state.currentView === newView) {
                return;
            }
            this.setState({
                currentView: newView,
                dateCursor: this.makeDateCursor(newView)
            });
        }
        /**
         * Palauttaa kalenterin settings-objektin.
         *
         * @access public
         * @returns {Object}
         */
        get settings() {
            return this.settingsi;
        }
        /**
         * Luo ja configuroi Layout-komponentin, joka vastaa kalenterin
         * renderöinnistä.
         */
        render() {
            return $el(Layout.default, {
                dateCursor: this.state.dateCursor,
                currentView: this.state.currentView,
                changeView: this.changeView.bind(this),
                titleFormatters: this.settingsi.titleFormatters,
                contentLayers: this.settingsi.contentLayers
            });
        }
        /**
         * @access private
         */
        makeDateCursor(viewName) {
            return DateCursors.dateCursorFactory.newCursor(viewName, () => {
                this.setState({dateCursor: this.state.dateCursor});
            });
        }
    }
    /**
     * Palauttaa validin settings-objektin, tai heittää errorin jos jokin
     * {userSettings}in arvo ei ollut validi.
     *
     * @param {Object=} props.settings || {}
     * @returns {Object} {
     *     defaultView: {string=},
     *     titleFormatters: {Object=}
     * }
     */
    function makeSettings(userSettings) {
        return {
            defaultView: getValidViewName(userSettings.defaultView || 'default'),
            contentLayers: getValidContentLayers(userSettings.contentLayers),
            titleFormatters: getValidTitleFormatters(userSettings.titleFormatters)
        };
    }
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
    return {default: Calendar};
});
