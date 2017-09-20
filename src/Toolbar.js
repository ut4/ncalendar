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
 * Manageri, jolla esim. laajennos voi lisätä omia toolbarPart:eja, joihin taas
 * voidaan viitata rekisteröinnin jälkeen kalenterin toolbarParts-asetuksessa.
 */
const partGeneratorManager = {
    /**
     * @access public
     * @param {string} name
     * @param {Function} generatorFn
     */
    add(name, generatorFn) {
        PartGenerators.prototype[name] = generatorFn;
        validPartNames.push(name);
    }
};

export default Toolbar;
export { partGeneratorManager, validPartNames };
