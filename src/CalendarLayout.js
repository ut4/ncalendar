import Modal from './Modal.js';
import Toolbar from './Toolbar.js';
import ViewLayouts from './ViewLayouts.js';
import {DateCursorFactory} from './DateCursors.js';
import Constants from './Constants.js';
import settingsFactory, {getValidViewName} from './settingsFactory.js';
import DateUtils from './DateUtils.js';
import ExtensionFactory from './ExtensionFactory.js';

/*
 * Kalenterin juurikomponentti.
 */
class CalendarLayout extends React.Component {
    /**
     * @param {object} props {
     *     defaultView: {string=},
     *     defaultDate: {Date=},
     *     extensions: {Array=},
     *     toolbarParts: {string=},
     *     titleFormatters: {Object=},
     *     layoutChangeBreakPoint: {number=},
     *     hours: {Object=},
     *     locale: {string|string[]=}
     * }
     */
    constructor(props) {
        super(props);
        // Luo asetukset & rekisteröi mediaquery
        this.settings = settingsFactory.makeSettings(this.props);
        this.smallScreenMediaQuery = window.matchMedia(`(max-width:${this.settings.layoutChangeBreakPoint}px)`);
        this.dateUtils = new DateUtils(this.settings.locale);
        this.dateCursorFactory = new DateCursorFactory(this.dateUtils);
        // Luo initial state
        const state = {dateCursor: this.newDateCursor(this.settings.defaultView)};
        state.currentView = this.settings.defaultView;
        state.viewLayout = this.newViewLayout(state.currentView, state.dateCursor);
        state.isWindowNarrowerThanBreakPoint = this.smallScreenMediaQuery.matches;
        this.state = state;
        //
        this.controller = newController(this);
        if (this.settings.extensions.length > 0) {
            const extensionFactory = new ExtensionFactory();
            this.extensions = this.settings.extensions.map(name => {
                const ext = extensionFactory.make(name, [this.controller]);
                ext.configuredName = name;
                return ext;
            });
        } else {
            this.extensions = [];
        }
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
     * Palauttaa instantoidun laajennoksen {name}, tai undefined, jos sellaista
     * ei löytynyt.
     *
     * @param {string} name
     * @returns {Object} laajennosinstanssi
     */
    getExtension(name) {
        return this.extensions.find(extensionInstance =>
            extensionInstance.configuredName === name
        );
    }
    /**
     * Vaihtaa kalenterin currentView:iksi {to}, mikäli se ei ole jo valmiiksi,
     * uudelleeninstantioi dateCursorin, ja triggeröi laajennoksien
     * uudelleenlatauksen.
     *
     * @param {string} to 'day'|'week'|'month'
     */
    changeView(to) {
        const newView = getValidViewName(to);
        if (this.state.currentView === newView) {
            return;
        }
        const state = {dateCursor: this.newDateCursor(newView, this.state.dateCursor.range)};
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
    newDateCursor(viewName, lastViewsRange) {
        return this.dateCursorFactory.newCursor(viewName, lastViewsRange || this.settings.defaultDate, () => {
            this.setState({dateCursor: this.state.dateCursor});
        });
    }
    /**
     * @access private
     * @returns {Day|Week|MonthViewLayout}
     */
    newViewLayout(viewName, dateCursor) {
        return new ViewLayouts[viewName](dateCursor, this.dateUtils);
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
            this.state.isWindowNarrowerThanBreakPoint,
            this.settings.hours
        );
        return $el('div', {className},
            $el(Modal, {ref: cmp => {
                this.modal = cmp;
            }}),
            $el(Toolbar, {
                parts: this.settings.toolbarParts,
                calendarController: this.controller,
                dateUtils: this.dateUtils,
                extensions: this.extensions,
                titleFormatter: this.settings.titleFormatters[this.state.currentView] || null
            }),
            header !== null && $el(header.Component,
                header.props
            ),
            $el(content.Component, {
                ref: cmp => { cmp && (this.contentController = cmp.getController()); },
                grid: content.props.gridGeneratorFn(),
                currentView: this.state.currentView,
                extensions: this.extensions
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
        get contentController() {
            return component.contentController;
        },
        get dateUtils() {
            return component.dateUtils;
        },
        changeView: to => {
            return component.changeView(to);
        },
        openModal: componentConstruct => {
            component.modal.open(componentConstruct);
        },
        closeModal: () => {
            component.modal.close();
        },
        getExtension: name => component.getExtension(name)
    };
}

export default CalendarLayout;
