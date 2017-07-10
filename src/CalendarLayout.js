define(['src/Modal', 'src/Toolbar', 'src/ViewLayouts', 'src/DateCursors', 'src/Constants', 'src/settingsFactory'], (Modal, Toolbar, ViewLayouts, DateCursors, Constants, settingsFactory) => {
    'use strict';
    /*
     * Kalenterin juurikomponentti.
     */
    class CalendarLayout extends React.Component {
        /**
         * @param {object} props {
         *     settings: {
         *         defaultView: {string},
         *         titleFormatters: {Object},
         *         contentLayers: {Array},
         *         layoutChangeBreakPoint: {number}
         *     }=
         * }
         */
        constructor(props) {
            super(props);
            // Settings & mediaQuery
            this.settings = settingsFactory.default(this.props.settings || {});
            this.smallScreenMediaQuery = window.matchMedia(`(max-width:${this.settings.layoutChangeBreakPoint || 800}px)`);
            // State
            const state = {dateCursor: this.newDateCursor(this.settings.defaultView)};
            state.currentView = this.settings.defaultView;
            state.viewLayout = this.newViewLayout(state.currentView, state.dateCursor);
            state.isWindowNarrowerThanBreakPoint = this.smallScreenMediaQuery.matches;
            this.state = state;
            // Controller
            this.controller = newController(this);
        }
        /**
         * Lisää matchmedia-kuuntelijan.
         */
        componentWillMount() {
            this.smallScreenMediaQuery.addListener(this.viewPortListener.bind(this));
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
         * Matchmedia-kuuntelija. Päivittää state.isWindowNarrowerThanBreakPoint:n
         * arvoksi true, mikäli selaimen ikkuna on pienempi kuin määritelty arvo,
         * ja vastaavasti false, jos se on sitä suurempi.
         *
         * @access private
         * @param {MediaQueryList} newMatch
         */
        viewPortListener(newMatch) {
            const newIsNarrower = newMatch.matches;
            if (newIsNarrower !== this.state.isWindowNarrowerThanBreakPoint) {
                this.setState({isWindowNarrowerThanBreakPoint: newIsNarrower});
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
            if (this.state.isWindowNarrowerThanBreakPoint &&
                this.state.currentView !== Constants.VIEW_DAY) {
                className += '-compact compact';
            }
            //
            const [header, content] = this.state.viewLayout.getParts(
                this.state.isWindowNarrowerThanBreakPoint
            );
            return $el('div', {className},
                $el(Modal.default, {ref: cmp => {
                    this.modal = cmp;
                }}),
                $el(Toolbar.default, {
                    calendarController: this.controller,
                    titleFormatter: this.settings.titleFormatters[this.state.currentView] || null
                }),
                header !== null && $el(header.Component,
                    header.props
                ),
                $el(content.Component, {
                    grid: content.props.gridGeneratorFn(),
                    currentView: this.state.currentView,
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
                return component.state.isWindowNarrowerThanBreakPoint;
            },
            changeView: to => {
                return component.changeView(to);
            },
            openModal: componentConstruct => {
                component.modal.open(componentConstruct);
            },
            closeModal: () => {
                component.modal.close();
            }
        };
    }
    return {default: CalendarLayout};
});
