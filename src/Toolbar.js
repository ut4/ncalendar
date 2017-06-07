define(['src/Constants'], Constants => {
    'use strict';
    const titleFormatters = {
        [Constants.VIEW_DAY]: (dateCursor) => {
            return '%1, %2'
                .replace('%1', Intl.DateTimeFormat('fi', {day: 'numeric', month: 'long'}).format(dateCursor.range.start))
                .replace('%2', dateCursor.range.start.getFullYear());
        },
        [Constants.VIEW_WEEK]: (dateCursor) => {
            return '%1 %2 - %3 %4'
                .replace('%1', Intl.DateTimeFormat('fi', {month: 'short'}).format(dateCursor.range.start))
                .replace('%2', dateCursor.range.start.getDate())
                .replace('%3', dateCursor.range.end.getDate())
                .replace('%4', dateCursor.range.start.getFullYear());
        },
        [Constants.VIEW_MONTH]: (dateCursor) => {
            return Intl.DateTimeFormat('fi', {month: 'long', year: 'numeric'}).format(dateCursor.range.start);
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
         *     onViewChange: {Function}
         * }
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi kalanterin hallintapaneelin.
         */
        render() {
            return $el('div', {className: 'toolbar'},
                $el('div', {className: 'fluid'},
                    $el('div', {className: 'col'},
                        $el('button', {disabled: 'disabled'}, '<'),
                        $el('button', {disabled: 'disabled'}, '>'),
                        $el('button', {disabled: 'disabled'}, 'Tänään')
                    ),
                    $el('div', {className: 'col'},
                        $el('h2', null, titleFormatters[this.props.currentView](this.props.dateCursor))
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
    return {default: Toolbar};
});
