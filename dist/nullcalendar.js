/*!
 * nullcalendar v0.2.0
 * https://github.com/ut4/ncalendar
 * @license BSD-3-Clause
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.nullcalendar = factory());
}(this, (function () { 'use strict';

// 1. window.React && window.ReactDOM
if (window.Inferno) {
    window.React = Inferno;
    window.React.ON_INPUT = 'onInput';
    window.ReactDOM = Inferno;
} else if (window.preact) {
    window.React = preact;
    window.React.ON_INPUT = 'onInput';
    window.ReactDOM = {render: (component, containerNode, replaceNode) =>
        preact.render(component, containerNode, replaceNode)._component
    };
} else if (window.React) {
    window.React.ON_INPUT = 'onChange';
} else {
    throw new Error('nullcalendar tarvitsee Inferno, preact, tai React\'n toimiakseen');
}
// 2. window.$el
window.$el = React.createElement;

/**
 * Kalenterikontrolleri/API:n kautta avattava/suljettava näkymä, johon voidaan
 * ladata custom-sisältöä.
 */
class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {contentConstruct: null};
    }
    /**
     * @access public
     * @param {ComponentConstruct} construct
     */
    open(construct) {
        this.setState({contentConstruct: construct});
    }
    /**
     * @access public
     */
    close() {
        this.setState({contentConstruct: null});
    }
    /**
     * Renderöi modalin, tai ei tee mitään jos sisältöa ei ole asetettu.
     */
    render() {
        return this.state.contentConstruct
            ? $el('div', {className: 'modal'},
                $el('div', {className: 'modal-content'},
                    $el(
                        this.state.contentConstruct.Component,
                        Object.assign({}, this.state.contentConstruct.props, {
                            closeModal: () => this.close()
                        })
                    )
                )
            )
            : null;
    }
}

var Constants = Object.freeze({
    VIEW_DAY: 'day',
    VIEW_WEEK: 'week',
    VIEW_MONTH: 'month',
    VIEW_DEFAULT: 'week',

    HOURS_IN_DAY: 24,
    DAYS_IN_WEEK: 7
});

const titleFormatters = {
    [Constants.VIEW_DAY]: (dateCursorRange, dateUtils) =>
        '%1, %2'
            .replace('%1', dateUtils.format(dateCursorRange.start, {day: 'numeric', month: 'long'}))
            .replace('%2', dateCursorRange.start.getFullYear())
    ,
    [Constants.VIEW_WEEK]: (dateCursorRange, dateUtils) =>
        '%1 %2 - %3 %4'
            .replace('%1', dateUtils.format(dateCursorRange.start, {month: 'short'}))
            .replace('%2', dateCursorRange.start.getDate())
            .replace('%3', dateCursorRange.end.getDate())
            .replace('%4', dateCursorRange.start.getFullYear())
    ,
    [Constants.VIEW_MONTH]: (dateCursorRange, dateUtils) =>
        dateUtils.format(dateCursorRange.start, {month: 'long', year: 'numeric'})
};

/*
 * Kalenterilayoutin ylin osa. Sisältää oletuksena päänavigaatiopainikkeet,
 * otsakkeen, ja näkymänavigaatiopainikkeet. Konfiguroitavissa.
 *  ___________________________
 * |______--> Toolbar <--______|
 * |__________Header___________|
 * |                           |
 * |         Content           |
 * |___________________________|
 */
class Toolbar extends React.Component {
    /**
     * @param {object} props {
     *     parts: {string},
     *     calendarController: {Object},
     *     dateUtils: {Object},
     *     titleFormatter: {Function=}
     * }
     */
    constructor(props) {
        super(props);
        this.partGenerators = new PartGenerators(props);
    }
    render() {
        return $el('div', {className: 'toolbar'},
            $el('div', {className: 'row'}, this.props.parts.split('|').map((group, r) =>
                $el('div', {className: 'col', key: r},
                    group.split(',').map(partName => this.partGenerators[partName]())
                )
            ))
        );
    }
}

class PartGenerators {
    constructor(props) { this.ctrl = props.calendarController; this.props = props; }
    prev() { return $el('button', {onClick: () => this.ctrl.dateCursor.prev(), key: 'prev' }, '<'); }
    next() { return $el('button', {onClick: () => this.ctrl.dateCursor.next(), key: 'next' }, '>'); }
    today() { return $el('button', {onClick: () => this.ctrl.dateCursor.reset(), key: 'today' }, 'Tänään'); }
    title() { return $el('h2', {key: 'title'}, (this.props.titleFormatter || titleFormatters[this.ctrl.currentView])(
        this.ctrl.dateCursor.range, this.props.dateUtils
    )); }
    month() { return $el('button', {onClick: () => { this.ctrl.changeView(Constants.VIEW_MONTH); }, key: 'month'}, 'Kuukausi'); }
    week() { return $el('button', {onClick: () => { this.ctrl.changeView(Constants.VIEW_WEEK); }, key: 'week'}, 'Viikko'); }
    day() { return $el('button', {onClick: () => { this.ctrl.changeView(Constants.VIEW_DAY); }, key: 'day'}, 'Päivä'); }
    fill() { return null; }
}
const validPartNames = Object.getOwnPropertyNames(PartGenerators.prototype).filter(prop => prop !== 'constructor');

/**
 * Jokaiselle ContentLayerFactory-instanssille yhteinen, staattinen säilytystila
 * rekisteröidyille sisältökerroksille.
 *
 * @var {Object}
 */
const register = {};

class ContentLayerFactory {
    /**
     * Rekisteröi sisältökerroksen {ConstructorOrFactory} nimellä {name},
     * tai heittää poikkeuksen jos {name} on jo rekisteröity.
     *
     * @access public
     * @param {string} name
     * @param {Function} constructorOrFactory
     */
    register(name, constructorOrFactory) {
        if (this.isRegistered(name)) {
            throw new Error(`Layer "${name}" on jo rekisteröity.`);
        }
        if (typeof constructorOrFactory !== 'function') {
            throw new Error('Rekisteröitävä itemi tulisi olla luokka, tai funktio.');
        }
        register[name] = constructorOrFactory;
    }
    /**
     * Palauttaa tiedon löytyykö rekisteristä sisältökerros nimeltä {name}.
     *
     * @access public
     * @param {string} name
     * @returns {boolean}
     */
    isRegistered(name) {
        return register.hasOwnProperty(name);
    }
    /**
     * Luo uuden sisältökerroksen käyttäen rekisteröityä konstruktoria tai
     * factoryä {layer|layer.name}, tai heittää poikkeuksen mikäli rekisteröityä
     * itemiä ei löytynyt, tai se oli virheellinen.
     *
     * @access public
     * @param {string|Object} layer
     * @param {Array} args
     * @returns {Object} Uusi instanssi sisältölayerista {layer|layer.name}
     */
    make(layer, args) {
        if (typeof layer !== 'string') {
            layer.args && (args = layer.args(...args));
            layer = layer.name || '';
        }
        const item = register[layer];
        if (!item) {
            throw new Error(`Layeria "${layer}" ei ole rekisteröity.`);
        }
        if (!isValidContentLayer(item.prototype)) {
            const providedLayer = item(...args);
            if (!isValidContentLayer(providedLayer)) {
                throw new Error('Sisältökerros-factory:n palauttama instanssi ' +
                    ' tulisi implementoida metodit "load", ja "decorateCell"');
            }
            return providedLayer;
        } else {
            return new item(...args);
        }
    }
}

function isValidContentLayer(obj) {
    return obj && typeof obj.load === 'function' && typeof obj.decorateCell === 'function';
}

const HOURS_ARRAY = Array.from(Array(Constants.HOURS_IN_DAY).keys());
const LoadType = Object.freeze({
    INITIAL: 'initial',
    NAVIGATION: 'navigation',
    VIEW_CHANGE: 'view-change'
});

/*
 * Kalenterin pääsisältö, renderöi ViewLayoutin generoiman gridin, ja lisää
 * valittujen sisältökerroksien (jos niitä on) luoman sisällön gridin soluihin.
 *  ___________________________
 * |__________Toolbar__________|
 * |__________Header___________|
 * |                           |
 * |      --> Content <--      |
 * |___________________________|
 */
class Content extends React.Component {
    /**
     * @param {object} props {
     *     grid: {Array},
     *     calendarController: {Object},
     *     currentView: {string}
     * }
     */
    constructor(props) {
        super(props);
        const selectedContentLayers = this.props.calendarController.settings.contentLayers;
        this.hasAsyncContent = selectedContentLayers.length > 0;
        this.state = {currentlyHasAsyncContent: undefined};
        if (this.hasAsyncContent) {
            const contentLayerFactory = new ContentLayerFactory();
            this.contentLayers = selectedContentLayers.map(layerConfig =>
                contentLayerFactory.make(layerConfig, [
                    this.newController(),
                    this.props.calendarController
                ])
            );
            this.loadAsyncContent(LoadType.INITIAL);
        }
    }
    /**
     * Poistaa props.gridistä sisältökerroksien modifikaatiot (children &
     * clickHandlers).
     */
    resetGrid() {
        return this.props.grid.map(rows => rows.map(cell => {
            if (cell && !(cell instanceof ImmutableCell)) {
                cell.children = [];
                cell.clickHandlers = [];
            }
        }));
    }
    /**
     * Triggeröi sisältökerroksien päivityksen, jos niitä on.
     */
    componentWillReceiveProps(props) {
        if (this.hasAsyncContent) {
            this.setState({currentlyHasAsyncContent: undefined});
            this.loadAsyncContent(props.currentView === this.props.currentView
                ? LoadType.NAVIGATION
                : LoadType.VIEW_CHANGE
            );
        }
    }
    /**
     * Disabloi sisältökerroksien lataustapahtuman jälkeisen renderöinnin, jos
     * yksikään ladatuista kerroksista ei palauttanut sisältöä.
     */
    shouldComponentUpdate(_, state) {
        return state.currentlyHasAsyncContent !== false;
    }
    /**
     * Lataa & ajaa sisältökerrokset, esim. eventLayerin tapahtumat.
     *
     * @access private
     */
    loadAsyncContent(loadType) {
        return Promise.all(
            this.contentLayers.map(layer => layer.load(loadType))
        ).then(returnValues => {
            const layersWhichMaybeHadContent = this.contentLayers.filter((layer, i) =>
                // Layerit, joiden load palautti false, skipataan. Jos layer
                // ei palauttanut mitään, tai jotain muuta kuin false, ladataan
                // normaalisti.
                returnValues[i] !== false
            );
            if (layersWhichMaybeHadContent.length > 0) {
                this.applyAsyncContent(layersWhichMaybeHadContent);
                this.setState({currentlyHasAsyncContent: true});
            }
        });
    }
    /**
     * Traversoi kalenterin jokaisen sisältösolun, ja tarjoaa ne sisältökerroksien
     * dekoroitavaksi. Sisältökerros voi tällöin esim. lisätä solun children-,
     * tai clickHandlers-taulukkoon omat lisäyksensä.
     *
     * @access private
     */
    applyAsyncContent(layersToLoad) {
        this.resetGrid();
        (layersToLoad || this.contentLayers).forEach(layer => {
            this.props.grid.forEach(row => {
                row.forEach(cell => {
                    (cell instanceof Cell) && layer.decorateCell(cell);
                });
            });
        });
    }
    /**
     * @access private
     * @param {Cell} cell
     * @param {string} key
     * @returns {VNode}
     */
    newCell(cell, key) {
        let content;
        if (!cell) {
            content = null;
        } else if (!cell.children || !cell.children.length) {
            content = cell.content;
        } else {
            content = this.nestedContent(cell);
        }
        const attrs = {className: 'cell'};
        if (cell && cell.clickHandlers && cell.clickHandlers.length) {
            attrs.onClick = e => {
                if (e.which && e.which !== 1) { return; }
                cell.clickHandlers.forEach(fn => fn(cell, e));
            };
        }
        return $el('div', {className: 'col' + (cell && cell.isCurrentDay ? ' current' : ''), key},
            $el('div', attrs, $el('div', null, content))
        );
    }
    /**
     * @access private
     * @param {Cell} cell
     * @returns {VNode|VNode[]}
     */
    nestedContent(cell) {
        const children = cell.children.map((child, i) =>
            $el(child.Component, Object.assign({}, child.props, {key: i}), child.content)
        );
        return cell.content
            ? [$el('span', null, cell.content)].concat(children)
            // Luultavasti viikko-gridin cell, joissa ei sisältöä
            : children;
    }
    /**
     * Public API-versio tästä luokasta sisältökerroksia varten.
     */
    newController() {
        return {
            LoadType,
            Cell,
            PlaceholderCell,
            refresh: () => {
                this.applyAsyncContent();
                this.forceUpdate();
            },
            reRender: () => {
                this.forceUpdate();
            },
            getRenderedGrid: () => this.mainEl
        };
    }
    render() {
        return $el('div', {className: 'main', ref: el => { this.mainEl = el; }},
            this.props.grid.map((row, rowIndex) =>
                $el('div', {className: 'row', key: rowIndex},
                    row.map((cell, colIndex) => this.newCell(cell, rowIndex + '.' + colIndex)
                ))
            )
        );
    }
}
class Cell {
    constructor(content, date, isCurrentDay) {
        this.content = content;
        this.date = date;
        this.isCurrentDay = isCurrentDay;
        this.children = [];
        this.clickHandlers = [];
    }
}
class PlaceholderCell extends Cell {}
class ImmutableCell {
    constructor(content) {
        this.content = content;
    }
}

class ComponentConstruct {
    constructor(Component, props, content) {
        this.Component = Component;
        this.props = props;
        this.content = content;
    }
}

/*
 * ViewLayoutien juuriluokka.
 */
class AbstractViewLayout {
    /**
     * @param {DateCursor} dateCursor
     * @param {DateUtils} dateUtils
     */
    constructor(dateCursor, dateUtils) {
        this.dateCursor = dateCursor;
        this.dateUtils = dateUtils;
    }
    /**
     * @access public
     * @param {boolean} compactFormShouldBeUsed
     * @returns {Array}
     */
    getParts(compactFormShouldBeUsed) {
        return !compactFormShouldBeUsed ? this.getFullLayout() : this.getCompactLayout();
    }
    /**
     * @access protected
     * @returns {Array}
     */
    getFullLayout() {
        return [
            new ComponentConstruct(Header, {items: this.getHeaderCells()}),
            new ComponentConstruct(Content, {gridGeneratorFn: () => this.getFullGrid()})
        ];
    }
    /**
     * @access protected
     * @returns {Array}
     */
    getCompactLayout() {
        return [
            null,
            new ComponentConstruct(Content, {gridGeneratorFn: () => this.getCompactGrid()})
        ];
    }
}

/*
 * Kalenterin toolbarin alapuolelle renderöitävä header-rivi.
 *  ___________________________
 * |__________Toolbar__________|
 * |______--> Header <--_______|
 * |                           |
 * |         Content           |
 * |___________________________|
 */
class Header extends React.Component {
    render() {
        return $el('div', {className: 'header'},
            $el('div', {className: 'row'}, this.props.items.map((item, i) =>
                $el('div', {key: i + item, className: 'col'}, $el('div', {className: 'cell'}, item))
            ))
        );
    }
}

/*
 * Kalenterin pääsisältö day-muodossa.
 */
class DayViewLayout extends AbstractViewLayout {
    /**
     * Palauttaa 2-sarakkellisen headerin, jossa yksi tyhjä solu tuntisaraketta
     * varten, ja yksi viikonpäiväsolu.
     *
     * @access protected
     * @returns {Array}
     */
    getHeaderCells() {
        return ['', this.dateUtils.format(this.dateCursor.range.start, {weekday: 'long'})];
    }
    /**
     * Day-näkymällä ei ole erillistä compact-muotoa.
     *
     * @access protected
     * @returns {Array}
     */
    getCompactLayout() {
        return this.getFullLayout();
    }
    /**
     * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
     * ja yksi päiväsarake. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
     * `mm:ss` wrapattuna ImmutableCell-instanssiin, ja sisältösarakkeen
     * sisältönä aina null wrapattuna Cell-instanssiin.
     *
     * @access protected
     * @returns {Array}
     */
    getFullGrid() {
        const rollingDate = new Date(this.dateCursor.range.start);
        const isToday = rollingDate.toDateString() === new Date().toDateString();
        // Päivän jokaiselle tunnille rivi, ...
        return HOURS_ARRAY.map(hour => {
            rollingDate.setHours(hour);
            // jossa tuntisarake, ja sisältösarake.
            return [
                new ImmutableCell(this.dateUtils.formatHour(hour)),
                new Cell(null, new Date(rollingDate), isToday)
            ];
        });
    }
}

/*
 * Kalenterin pääsisältö week, ja week-compact -muodossa.
 */
class WeekViewLayout extends AbstractViewLayout {
    /**
     * Palauttaa 8-sarakkellisen headerin, jossa yksi tyhjä solu tuntisaraketta
     * varten, ja yksi viikonpäiväsolu jokaiselle viikonpäivälle.
     *
     * @access protected
     * @returns {Array}
     */
    getHeaderCells() {
        return [''].concat(this.dateUtils.getFormattedWeekDays(
            this.dateCursor.range.start,
            'short'
        ));
    }
    /**
     * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
     * ja 7 päiväsaraketta. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
     * `mm:ss` wrapattuna ImmutableCell-instanssiin, ja sisältösarakkeen
     * sisältönä aina null wrapattuna Cell-instanssiin.
     *
     * @access protected
     * @returns {Array}
     */
    getFullGrid() {
        // Vuorokauden jokaiselle tunnille rivi, ...
        return this.markCurrentDayColumn(HOURS_ARRAY.map(hour => {
            const rollingDate = new Date(this.dateCursor.range.start);
            rollingDate.setHours(hour);
            // jossa tuntisarake, ...
            const row = [new ImmutableCell(this.dateUtils.formatHour(hour))];
            // ja sarakkeet jokaiselle viikonpäivälle
            while (row.push(new Cell(null, new Date(rollingDate))) <= Constants.DAYS_IN_WEEK) {
                rollingDate.setDate(rollingDate.getDate() + 1);
            }
            return row;
        }));
    }
    /**
     * Generoi viikonpäivien nimet täydellisessä muodossa 2 * 4 taulukkoon
     * Cell-instansseihin wrapattuna.
     *
     * @access protected
     * @returns {Array}
     */
    getCompactGrid() {
        const dayNames = this.dateUtils.getFormattedWeekDays(
            this.dateCursor.range.start,
            'long'
        );
        const rollingDate = new Date(this.dateCursor.range.start);
        const getDateAndMoveToNexDay = () => {
            const d = new Date(rollingDate);
            rollingDate.setDate(rollingDate.getDate() + 1);
            return d;
        };
        return this.markCurrentDayColumn([
            [
                new Cell(dayNames[0], getDateAndMoveToNexDay()),
                new Cell(dayNames[1], getDateAndMoveToNexDay())
            ], [
                new Cell(dayNames[2], getDateAndMoveToNexDay()),
                new Cell(dayNames[3], getDateAndMoveToNexDay())
            ], [
                new Cell(dayNames[4], getDateAndMoveToNexDay()),
                new Cell(dayNames[5], getDateAndMoveToNexDay())
            ], [
                new Cell(dayNames[6], getDateAndMoveToNexDay()),
                new PlaceholderCell(null, null)
            ]
        ], true);
    }
    /**
     * Asettaa kuluvalle päivälle kuuluvien Cell-instanssien
     * isCurrentDay -> true.
     *
     * @access private
     */
    markCurrentDayColumn(grid, isCompactView) {
        const now = new Date();
        // range == kuluva viikko?
        if (this.dateUtils.getStartOfWeek(now).toDateString() ===
            this.dateCursor.range.start.toDateString()) {
            const colIndex = now.getDay() || 7;
            if (!isCompactView) {
                grid.forEach(row => { row[colIndex].isCurrentDay = true; });
            } else {
                grid[Math.round(colIndex / 2) - 1][!(colIndex % 2) ? 1 : 0].isCurrentDay = true;
            }
        }
        return grid;
    }
}

/*
 * Kalenterin pääsisältö month, ja month-compact -muodossa
 */
class MonthViewLayout extends AbstractViewLayout {
    /**
     * Palauttaa 8-sarakkellisen headerin, jossa yksi tyhjä solu viikkonumero-
     * saraketta varten, ja yksi viikonpäiväsolu jokaiselle viikonpäivälle.
     *
     * @access protected
     * @returns {Array}
     */
    getHeaderCells() {
        return [''].concat(this.dateUtils.getFormattedWeekDays(
            this.dateCursor.range.start,
            'long'
        ));
    }
    /**
     * Generoi kuukauden päivät numeerisessa muodossa 7 * ~5 taulukkoon Cell-
     * instansseihin wrapattuna. Ensimmäisen rivina alussa, ja viimeisen rivin
     * lopussa voi olla undefined-soluja.
     *
     * @access protected
     * @returns {Array}
     */
    getFullGrid() {
        const d = new Date(this.dateCursor.range.start);
        const currentDayDateStr = new Date().toDateString();
        // Generoi rivit viikonpäiville
        return this.generateGrid(Constants.DAYS_IN_WEEK, d =>
            new Cell(d.getDate(), new Date(d), d.toDateString() === currentDayDateStr)
        // Lisää jokaisen rivi alkuun viikkonumero
        ).map(row => {
            row.unshift(new ImmutableCell(this.dateUtils.getWeekNumber(d)));
            d.setDate(d.getDate() + 7);
            return row;
        });
    }
    /**
     * Generoi kuukauden päivät muodossa `{pvmNumeerinen} + {viikonPäiväLyhyt}`
     * 2 * ~15 taulukkoon Cell-instansseihin wrapattuna.
     *
     * @access protected
     * @returns {Array}
     */
    getCompactGrid() {
        const dayNames = this.dateUtils.getFormattedWeekDays(
            this.dateCursor.range.start,
            'short'
        );
        const currentDayDateStr = new Date().toDateString();
        return this.generateGrid(2, d => {
            const dateAndDayName = d.getDate() + ' ' + dayNames[(d.getDay() || 7) - 1];
            // Lisää viikkonumero ensimmäisen solun-, ja viikon ensimmäisten päivien perään
            return new Cell(d.getDay() !== 1 && d.getDate() > 1
                ? dateAndDayName
                : [dateAndDayName, $el('span', null, ' / Vk' + this.dateUtils.getWeekNumber(d))]
            , new Date(d), d.toDateString() === currentDayDateStr);
        });
    }
    /**
     * Generoi kuukauden kaikki päivät {gridWidth} * {?} taulukkoon. Ensimmäisen
     * rivin alkuun, ja viimeisen rivin loppuun lisätään "tyhjää", jos kuukauden
     * ensimmäinen päivä ei ole maanantai, tai viimeinen sunnuntai (ja {gridWith} = 7).
     * Esimerkkipaluuarvo, jos kuukauden ensimmäinen päivä on keskiviikko;
     * [[undefined, undefined, 1, 2 ...], [6, 7...], ...]. Solujen sisältö
     * määräytyy {formatFn}:n mukaan.
     *
     * @access private
     * @param {number} gridWidth
     * @param {Function} formatFn fn({Date} d || undefined)
     * @returns {Array}
     */
    generateGrid(gridWidth, formatFn) {
        const startDate = this.dateCursor.range.start;
        const rollingDate = new Date(startDate);
        const grid = [];
        let row = [];
        // Lisää ensimmäisen rivin "tyhjät, jos kyseessä Ma-Su grid
        if (gridWidth === Constants.DAYS_IN_WEEK) {
            row.length = (startDate.getDay() || 7) - 1;
            row.fill(undefined);
        }
        // Lisää kuukauden päivät {gridWith} levyisinä riveinä
        while (rollingDate.getMonth() === startDate.getMonth()) {
            row.push(formatFn(rollingDate));
            if (row.length === gridWidth) { grid.push(row); row = []; }
            rollingDate.setDate(rollingDate.getDate() + 1);
        }
        // Tasaa viimeinen rivi
        if (row.length) {
            while (row.push(undefined) < gridWidth) {/**/}
            grid.push(row);
        }
        return grid;
    }
}

var ViewLayouts = {
    [Constants.VIEW_DAY]: DayViewLayout,
    [Constants.VIEW_WEEK]: WeekViewLayout,
    [Constants.VIEW_MONTH]: MonthViewLayout
};

class DayViewCursorRange {
    /**
     * @param {DateUtils} dateUtils
     * @param {Date|WeekViewCursorRange|MonthViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(dateUtils, startDateOrRangeOfPreviousView) {
        const d = getBasedate(startDateOrRangeOfPreviousView, DayViewCursorRange.lastRange);
        if (d instanceof Date) {
            this.start = dateUtils.getStartOfDay(d);
            this.end = dateUtils.getEndOfDay(d);
        } else {
            this.start = d.start;
            this.end = d.end;
        }
    }
    goForward() {
        this.start.setDate(this.start.getDate() + 1);
        this.end.setDate(this.end.getDate() + 1);
    }
    goBackwards() {
        this.start.setDate(this.start.getDate() - 1);
        this.end.setDate(this.end.getDate() - 1);
    }
}
class WeekViewCursorRange {
    /**
     * @param {DateUtils} dateUtils
     * @param {Date|DayViewCursorRange|MonthViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(dateUtils, startDateOrRangeOfPreviousView) {
        const d = getBasedate(startDateOrRangeOfPreviousView, WeekViewCursorRange.lastRange);
        if (d instanceof Date) {
            this.start = dateUtils.getStartOfWeek(dateUtils.getStartOfDay(d));
            this.end = dateUtils.getEndOfDay(this.start);
            this.end.setDate(this.start.getDate() + 6);
        } else {
            this.start = d.start;
            this.end = d.end;
        }
    }
    goForward() {
        this.start.setDate(this.start.getDate() + Constants.DAYS_IN_WEEK);
        this.end.setDate(this.end.getDate() + Constants.DAYS_IN_WEEK);
    }
    goBackwards() {
        this.start.setDate(this.start.getDate() - Constants.DAYS_IN_WEEK);
        this.end.setDate(this.end.getDate() - Constants.DAYS_IN_WEEK);
    }
}
class MonthViewCursorRange {
    /**
     * @param {DateUtils} dateUtils
     * @param {Date|DayViewCursorRange|WeekViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(dateUtils, startDateOrRangeOfPreviousView) {
        const baseDate = startDateOrRangeOfPreviousView.start || startDateOrRangeOfPreviousView;
        this.start = dateUtils.getStartOfDay(baseDate);
        this.start.setDate(1);
        this.end = dateUtils.getEndOfDay(this.start);
        // https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
        this.end.setMonth(this.start.getMonth() + 1);
        this.end.setDate(0);// 1. pvä - 1 (0) = edellisen kuun viimeinen
    }
    goForward() {
        this.start.setMonth(this.start.getMonth() + 1);
        this.start.setDate(1);
        this.end.setMonth(this.end.getMonth() + 2);
        this.end.setDate(0);
    }
    goBackwards() {
        this.start.setMonth(this.start.getMonth() - 1);
        this.start.setDate(1);
        this.end.setDate(0);
    }
}
function getBasedate(startDateOrRangeOfPreviousView, lastSavedRange) {
    if (startDateOrRangeOfPreviousView instanceof Date) {
        return startDateOrRangeOfPreviousView;
    }
    // Käytä aiemmin tallennettua rangea, jos ei poikkea edellisen näkymän rangesta liikaa
    if (lastSavedRange && isWithinRange(lastSavedRange.start, startDateOrRangeOfPreviousView)) {
        return lastSavedRange;
    }
    const d = new Date();
    // Käytä nykyhetkeä, jos se sattuu edellisen näkymän kanssa samalle viikolle/
    // kuukaudelle, muutoin käytä edellisen näkymän range.start:ia
    return !isWithinRange(d, startDateOrRangeOfPreviousView)
        ? startDateOrRangeOfPreviousView.start
        : d;
}
function isWithinRange(date, range) {
    return (date >= range.start && date <= range.end);
}

/*
 * Luokka, joka vastaa kalenterin aikakursorin manipuloinnista
 * selaustoimintojen yhteydessä. Kuuluu osaksi public calendar-API:a.
 */
class DateCursor {
    constructor(range, dateUtils, subscribeFn) {
        this.range = range;
        this.dateUtils = dateUtils;
        saveRange(this.range);
        if (subscribeFn) {
            this.notify = subscribeFn;
        }
    }
    /**
     * Siirtää kursoria eteenpäin Calendarin "currentView"-arvosta riippuen
     * 24h, 7pvä tai 1kk.
     */
    next() {
        this.range.goForward();
        saveRange(this.range);
        this.notify('next');
    }
    /**
     * Siirtää kursoria taaksepäin Calendarin "currentView"-arvosta riippuen
     * 24h, 7pvä tai 1kk.
     */
    prev() {
        this.range.goBackwards();
        saveRange(this.range);
        this.notify('prev');
    }
    /**
     * Siirtää kursorin takaisin nykyhetkeen.
     */
    reset() {
        this.range = new this.range.constructor(this.dateUtils, new Date());
        saveRange(this.range);
        this.notify('reset');
    }
    goTo() {
        this.notify('goTo');
    }
}
/**
 * Päivittää rangeluokan lastRange -staattisen propertyn.
 */
function saveRange(range) {
    range.constructor.lastRange = {
        start: new Date(range.start),
        end: new Date(range.end)
    };
}
const cursorRanges = {
    [Constants.VIEW_DAY]: DayViewCursorRange,
    [Constants.VIEW_WEEK]: WeekViewCursorRange,
    [Constants.VIEW_MONTH]: MonthViewCursorRange
};

class DateCursorFactory {
    /**
     * @param {DateUtils} dateUtils
     */
    constructor(dateUtils) {
        this.dateUtils = dateUtils;
    }
    /**
     * @param {string} viewName 'day'|'week'|'month'
     * @param {Date|DayViewCursorRange|WeekViewCursorRange|MonthViewCursorRange} startDateOrRangeFromPreviousView
     * @param {Function} subscriberFn
     */
    newCursor(viewName, startDateOrRangeFromPreviousView, subscriberFn) {
        return new DateCursor(
            new cursorRanges[viewName](this.dateUtils, startDateOrRangeFromPreviousView || new Date()),
            this.dateUtils,
            subscriberFn
        );
    }
}

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
var settingsFactory = userSettings => ({
    defaultView: getValidViewName(userSettings.defaultView),
    defaultDate: getValidValue(userSettings.defaultDate, validateDefaultDate, new Date()),
    contentLayers: getValidValue(userSettings.contentLayers, validateLayers, []),
    toolbarParts: getValidValue(userSettings.toolbarParts, validateToolbarParts, 'prev,next,today|title|month,week,day'),
    titleFormatters: getValidValue(userSettings.titleFormatters, validateFormatters, {}),
    layoutChangeBreakPoint: getValidValue(userSettings.layoutChangeBreakPoint, validateBreakPoint, 800),
    locale: getValidValue(userSettings.locale, validateLocale, undefined)
});

const EMPTY_WEEK = Array.from(Array(7));

class DateUtils {
    /**
     * @param {string|string[]} locale 'fi', 'en-US' etc.
     */
    constructor(locale) {
        this.locale = locale;
    }
    // https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php#answer-6117889
    getWeekNumber(date) {
        // Copy date so don't modify original
        const d = new Date(date);
        d.setHours(0,0,0,0);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        // Calculate full weeks to nearest Thursday
        return Math.ceil(( ( (d - new Date(d.getFullYear(),0,1)) / 86400000) + 1)/7);
    }
    getEstimatedFirstDayOfWeek() {
        // Kesäkuun ensimmäinen maanantai, 2017, klo 12:00:00
        return (new Date(2017, 5, 5, 12, 0, 0, 0)).getDay();
    }
    getStartOfWeek(date) {
        const firstDay = this.getEstimatedFirstDayOfWeek();
        const d = new Date(date);
        d.setDate(date.getDate() - (7 + date.getDay() - firstDay) % 7);
        return d;
    }
    getFormattedWeekDays(date, form) {
        const d = this.getStartOfWeek(date);
        return EMPTY_WEEK.map(() => {
            const formatted = this.format(d, {weekday: form});
            d.setDate(d.getDate() + 1);
            return formatted;
        });
    }
    getStartOfDay(date) {
        const start = new Date(date);
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        return start;
    }
    getEndOfDay(date) {
        const end = new Date(date);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        end.setMilliseconds(999);
        return end;
    }
    formatHour(hour) {
        return (hour < 10 ? '0' : '') + hour + ':00';
    }
    format(date, options) {
        return date.toLocaleString(this.locale, options);
    }
}

/*
 * Kalenterin juurikomponentti.
 */
class CalendarLayout extends React.Component {
    /**
     * @param {object} props {
     *     defaultView: {string=},
     *     defaultDate: {Date=},
     *     contentLayers: {Array=},
     *     toolbarParts: {string=},
     *     titleFormatters: {Object=},
     *     layoutChangeBreakPoint: {number=}
     *     locale: {string|string[]=}
     * }
     */
    constructor(props) {
        super(props);
        // Luo asetukset & rekisteröi mediaquery
        this.settings = settingsFactory(this.props);
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
            this.state.isWindowNarrowerThanBreakPoint
        );
        return $el('div', {className},
            $el(Modal, {ref: cmp => {
                this.modal = cmp;
            }}),
            $el(Toolbar, {
                parts: this.settings.toolbarParts,
                calendarController: this.controller,
                dateUtils: this.dateUtils,
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

const contentLayerFactory = new ContentLayerFactory();

/**
 * Kirjaston public API.
 */
var nullcalendar$1 = {
    /**
     * @param {HTMLElement} el DOM-elementti, johon kalenteri renderöidään
     * @param {Object=} settings Kalenterin configuraatio
     * @returns {Object} Kalenteri-instanssin kontrolleri/API
     */
    newCalendar: (el, settings) => {
        return ReactDOM.render($el(CalendarLayout, settings), el).getController();
    },
    /**
     * @param {string} name Nimi, jolla rekisteröidään
     * @param {Object|Function} layer Sisältökerroksen implementaatio @see https://github.com/ut4/ncalendar#extending
     */
    registerContentLayer: (name, layer) => contentLayerFactory.register(name, layer),
    /**
     * @prop {React.Component} Kalenterin juurikomponentti @see https://github.com/ut4/ncalendar#usage-jsx
     */
    Calendar: CalendarLayout
};

return nullcalendar$1;

})));
