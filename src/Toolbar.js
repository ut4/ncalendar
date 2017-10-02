import Constants from './Constants.js';

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
 * otsakkeen, ja näkymänavigaatiopainikkeet. Konfiguroitavissa asetuksien kautta.
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
     *     extensions: {Array},
     *     titleFormatter: {Function=}
     * }
     */
    constructor(props) {
        super(props);
        this.partFactories = new DefaultPartFactories(props);
        const toolbarPartRegistry = new ToolbarPartRegistry(this.partFactories);
        this.props.extensions.forEach(extension =>
            extension.addToolbarPartFactories(toolbarPartRegistry)
        );
    }
    render() {
        return $el('div', {className: 'toolbar'},
            $el('div', {className: 'row'}, this.props.parts.split('|').map((group, r) =>
                $el('div', {className: 'col', key: r},
                    group.split(',').map(partName => this.partFactories[partName]())
                )
            ))
        );
    }
}

class DefaultPartFactories {
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

/**
 * Manageri, joka validoi ja rekisteröi laajennoksien määrittelemät
 * toolbarPartFactoryt.
 */
class ToolbarPartRegistry {
    constructor(defaultFactories) {
        this.register = defaultFactories;
    }
    /**
     * @access public
     * @param {string} name
     * @param {Function} factoryFn
     */
    add(name, factory) {
        if (typeof name !== 'string') {
            throw new Error('ToolbarPartFactoryn nimi pitäisi olla typpiä "string"');
        }
        if (typeof factory !== 'function') {
            throw new Error('ToolbarPartFactory pitäisi olla funktio');
        }
        if (this.register[name]) {
            throw new Error(`Toolbarpart-factory "${name}" on jo rekisteröity`);
        }
        this.register[name] = factory;
    }
}

export default Toolbar;
