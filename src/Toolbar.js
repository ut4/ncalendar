define(['src/Constants'], Constants => {
    'use strict';
    const titleFormatters = {
        [Constants.VIEW_DAY]: dateCursorRange => {
            return '%1, %2'
                .replace('%1', Intl.DateTimeFormat('fi', {day: 'numeric', month: 'long'}).format(dateCursorRange.start))
                .replace('%2', dateCursorRange.start.getFullYear());
        },
        [Constants.VIEW_WEEK]: dateCursorRange => {
            return '%1 %2 - %3 %4'
                .replace('%1', Intl.DateTimeFormat('fi', {month: 'short'}).format(dateCursorRange.start))
                .replace('%2', dateCursorRange.start.getDate())
                .replace('%3', dateCursorRange.end.getDate())
                .replace('%4', dateCursorRange.start.getFullYear());
        },
        [Constants.VIEW_MONTH]: dateCursorRange => {
            return Intl.DateTimeFormat('fi', {month: 'long', year: 'numeric'}).format(dateCursorRange.start);
        }
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
    class Toolbar extends Inferno.Component {
        /**
         * @param {object} props {
         *     calendarController: {Object},
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
                        $el('h2', null, (this.props.titleFormatter || titleFormatters[ctrl.currentView])(ctrl.dateCursor.range))
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
    return {default: Toolbar, titleFormatters};
});
