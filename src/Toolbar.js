define(['src/Calendar'], Calendar => {
    'use strict';
    const titleFormatters = {
        [Calendar.views.DAY]: (dateCursor) => {
            return '%1, %2'
                .replace('%1', Intl.DateTimeFormat('fi', {day: 'numeric', month: 'long'}).format(dateCursor))
                .replace('%2', dateCursor.getFullYear());
        },
        [Calendar.views.WEEK]: (dateCursor) => {
            return '%1 %2 - %3 %4'
                .replace('%1', Intl.DateTimeFormat('fi', {month: 'short'}).format(dateCursor))
                .replace('%2', dateCursor.getDate())
                .replace('%3', dateCursor.getDate() + 7)
                .replace('%4', dateCursor.getFullYear());
        },
        [Calendar.views.MONTH]: (dateCursor) => {
            return Intl.DateTimeFormat('fi', {month: 'long', year: 'numeric'}).format(dateCursor);
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
         * @param {object} props {currentView: {string}, onViewChange: {Function}}
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
                        $el('h2', null, titleFormatters[this.props.currentView](Calendar.state.dateCursor))
                    ),
                    $el('div', {className: 'col'},
                        $el('button', {onClick: () => { this.props.onViewChange(Calendar.views.MONTH); }}, 'Kuukausi'),
                        $el('button', {onClick: () => { this.props.onViewChange(Calendar.views.WEEK); }}, 'Viikko'),
                        $el('button', {onClick: () => { this.props.onViewChange(Calendar.views.DAY); }}, 'Päivä')
                    )
                )
            );
        }
    }
    return {default: Toolbar};
});
