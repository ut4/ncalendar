define(['src/Toolbar', 'src/Constants', 'src/ViewLayouts', 'src/DateCursors', 'src/settingsFactory'], (Toolbar, Constants, ViewLayouts, DateCursors, settingsFactory) => {
    'use strict';
    const smallScreenCondition = window.matchMedia('(max-width:800px)');
    /*
     * Kalenterin juurikomponentti.
     */
    class CalendarLayout extends Inferno.Component {
        /**
         * @param {object} props {
         *     settings: {
         *         defaultView: {string},
         *         titleFormatters: {Object},
         *         contentLayers: {Array}
         *     }=
         * }
         */
        constructor(props) {
            super(props);
            this.settings = settingsFactory.default(props.settings || {});
            const state = {dateCursor: this.newDateCursor(this.settings.defaultView)};
            state.currentView = this.settings.defaultView;
            state.viewLayout = this.newViewLayout(state.currentView, state.dateCursor);
            state.smallScreenConditionMaches = smallScreenCondition.matches;
            this.state = state;
            this.controller = newController(this);
        }
        /**
         * Lisää matchmedia-kuuntelijan.
         */
        componentWillMount() {
            smallScreenCondition.addListener(this.viewPortListener.bind(this));
        }
        /**
         * Palauttaa per-kalenteri-API:n, jonka kautta kalenteria pääsääntöisesti
         * kontrolloidaan.
         */
        getController() {
            return this.controller;
        }
        /**
         * Vaihtaa kalenterin currentView:iksi {to}, mikäli se ei ole jo valmiiksi,
         * uudelleeninstantioi dateCursorin, ja triggeröi sisältökerroksien
         * uudelleenlatauksen.
         *
         * @access public
         * @param {string} to Constants.VIEW_DAY | Constants.VIEW_WEEK | Constants.VIEW_MONTH
         */
        changeView(to) {
            const newView = settingsFactory.getValidViewName(to);
            if (this.state.currentView === newView) {
                return;
            }
            const state = {dateCursor: this.newDateCursor(newView)};
            state.currentView = newView;
            state.viewLayout = this.newViewLayout(newView, state.dateCursor);
            this.setState(state);
        }
        /**
         * Matchmedia-kuuntelija. Päivittää state.smallScreenConditionMaches:n
         * arvoksi true, mikäli selaimen ikkuna on pienempi kuin {?}, tai false,
         * jos se on suurempi kuin {?}.
         *
         * @access private
         * @param {MediaQueryList} newMatch
         */
        viewPortListener(newMatch) {
            const newSmallScreenConditionMaches = newMatch.matches;
            if (newSmallScreenConditionMaches !== this.state.smallScreenConditionMaches) {
                this.setState({smallScreenConditionMaches: newSmallScreenConditionMaches});
            }
        }
        /**
         * @access private
         * @returns {DateCursor}
         */
        newDateCursor(viewName) {
            return DateCursors.dateCursorFactory.newCursor(viewName, () => {
                this.setState({dateCursor: this.state.dateCursor});
            });
        }
        /**
         * @access private
         * @return {Day|Week|MonthViewLayout}
         */
        newViewLayout(viewName, dateCursor) {
            return new ViewLayouts[viewName](dateCursor);
        }
        /**
         * Renderöi kalenterin kokonaisuudessaan mutaatiossa day, week,
         * week-compact, month, tai month-compact.
         */
        render() {
            //
            let className = 'cal ' + this.state.currentView;
            if (this.state.smallScreenConditionMaches &&
                this.state.currentView !== Constants.VIEW_DAY) {
                className += '-compact compact';
            }
            //
            const [header, content] = this.state.viewLayout.getParts(
                this.state.smallScreenConditionMaches
            );
            return $el('div', {className},
                $el(Toolbar.default, {
                    calendarController: this.controller,
                    titleFormatter: this.settings.titleFormatters[this.state.currentView] || null
                }),
                header !== null && $el(header.Component,
                    header.props
                ),
                $el(content.Component, {
                    grid: content.props.gridGeneratorFn(),
                    calendarController: this.controller
                })
            );
        }
    }
    /**
     * Yksittäisen kalenteri-instanssin public API. Käytetään myös sisäisesti
     * lapsikomponenteissa (Content, Toolbar).
     */
    function newController(component) {
        return {
            get currentView() {
                return component.state.currentView;
            },
            get dateCursor() {
                return component.state.dateCursor;
            },
            get settings() {
                return component.settings;
            },
            get isCompactViewEnabled() {
                return component.state.smallScreenConditionMaches;
            },
            changeView: to => {
                return component.changeView(to);
            }
        };
    }
    return {default: CalendarLayout};
});
