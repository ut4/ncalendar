import Register, {once} from './Register.js';
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

const partFactories = {
    prev(toolbar) { return $el('button', {onClick: () => toolbar.ctrl.dateCursor.prev(), key: 'prev' }, '<'); },
    next(toolbar) { return $el('button', {onClick: () => toolbar.ctrl.dateCursor.next(), key: 'next' }, '>'); },
    today(toolbar) { return $el('button', {onClick: () => toolbar.ctrl.dateCursor.reset(), key: 'today' }, 'Tänään'); },
    title(toolbar) { return $el('h2', {key: 'title'}, (toolbar.props.titleFormatter || titleFormatters[toolbar.ctrl.currentView])(
        toolbar.ctrl.dateCursor.range, toolbar.props.dateUtils
    )); },
    month(toolbar) { return $el('button', {onClick: () => { toolbar.ctrl.changeView(Constants.VIEW_MONTH); }, key: 'month'}, 'Kuukausi'); },
    week(toolbar) { return $el('button', {onClick: () => { toolbar.ctrl.changeView(Constants.VIEW_WEEK); }, key: 'week'}, 'Viikko'); },
    day(toolbar) { return $el('button', {onClick: () => { toolbar.ctrl.changeView(Constants.VIEW_DAY); }, key: 'day'}, 'Päivä'); },
    fill() { return null; }
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
        this.ctrl = this.props.calendarController;
        this.toolbarPartRegister = new Register(partFactories, 'toolbarPartFactory');
        this.props.extensions.forEach(extension => {
            once('addToolbarFactories#' + extension.configuredName, () =>
                extension.addToolbarPartFactories(this.toolbarPartRegister)
            );
        });
    }
    render() {
        return $el('div', {className: 'toolbar'},
            $el('div', {className: 'row'}, this.props.parts.split('|').map((group, r) =>
                $el('div', {className: 'col', key: r},
                    group.split(',').map(partName => this.toolbarPartRegister.get(partName)(this))
                )
            ))
        );
    }
}

export default Toolbar;
