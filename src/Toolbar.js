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
 * Kalenterilayoutin ylin osa. Sisältää päänavigaatiopainikkeet, otsakkeen,
 * ja näkymänavigaatiopainikkeet.
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
     *     calendarController: {Object},
     *     dateUtils: {Object},
     *     titleFormatter: {Function=}
     * }
     */
    constructor(props) {
        super(props);
    }
    render() {
        const ctrl = this.props.calendarController;
        return $el('div', {className: 'toolbar'},
            $el('div', {className: 'row'},
                $el('div', {className: 'col'},
                    $el('button', {onClick: () => ctrl.dateCursor.prev() }, '<'),
                    $el('button', {onClick: () => ctrl.dateCursor.next() }, '>'),
                    $el('button', {onClick: () => ctrl.dateCursor.reset() }, 'Tänään')
                ),
                $el('div', {className: 'col'},
                    $el('h2', null, (this.props.titleFormatter || titleFormatters[ctrl.currentView])(
                        ctrl.dateCursor.range, this.props.dateUtils
                    ))
                ),
                $el('div', {className: 'col'},
                    $el('button', {onClick: () => { ctrl.changeView(Constants.VIEW_MONTH); }}, 'Kuukausi'),
                    $el('button', {onClick: () => { ctrl.changeView(Constants.VIEW_WEEK); }}, 'Viikko'),
                    $el('button', {onClick: () => { ctrl.changeView(Constants.VIEW_DAY); }}, 'Päivä')
                )
            )
        );
    }
}

export default Toolbar;
