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
         *     currentView: {string},
         *     dateCursor: {DateCursor}
         *     onViewChange: {Function},
         *     titleFormatter: {Function=}
         * }
         */
        constructor(props) {
            super(props);
        }
        render() {
            return $el('div', {className: 'toolbar'},
                $el('div', {className: 'row'},
                    $el('div', {className: 'col'},
                        $el('button', {onClick: this.props.dateCursor.prev.bind(this.props.dateCursor)}, '<'),
                        $el('button', {onClick: this.props.dateCursor.next.bind(this.props.dateCursor)}, '>'),
                        $el('button', {onClick: this.props.dateCursor.reset.bind(this.props.dateCursor)}, 'Tänään')
                    ),
                    $el('div', {className: 'col'},
                        $el('h2', null, (this.props.titleFormatter || titleFormatters[this.props.currentView])(this.props.dateCursor.range))
                    ),
                    $el('div', {className: 'col'},
                        $el('button', {onClick: () => { this.props.onViewChange(Constants.VIEW_MONTH); }}, 'Kuukausi'),
                        $el('button', {onClick: () => { this.props.onViewChange(Constants.VIEW_WEEK); }}, 'Viikko'),
                        $el('button', {onClick: () => { this.props.onViewChange(Constants.VIEW_DAY); }}, 'Päivä')
                    )
                )
            );
        }
    }
    return {default: Toolbar, titleFormatters};
});
