define(['src/Calendar'], Calendar => {
    'use strict';
    const getStartOfWeek = date => {
        var d = new Date(date);
        var day = d.getDay();
        d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
        return d;
    };
    const EMPTY_WEEK = Array.from(Array(7));
    const getFormattedWeekDays = format => {
        const d = getStartOfWeek(Calendar.state.dateCursor);
        return EMPTY_WEEK.map(() => {
            const formatted = format.format(d);
            d.setDate(d.getDate() + 1);
            return formatted;
        });
    };
    /*
     * Kalenterin toolbarin alapuolelle renderöitävä headerline day-muodossa.
     *  ___________________________
     * |__________Toolbar__________|
     * |______--> Header <--_______|
     * |                           |
     * |         Content           |
     * |___________________________|
     */
    class DayHeader extends Inferno.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
            this.day = Intl.DateTimeFormat('fi', {weekday: 'long'}).format(Calendar.state.dateCursor);
        }
        /**
         * Renderöi 1 * 2 headerlinen
         */
        render() {
            return $el('div', {className: 'header'},
                $el('div', {className: 'fluid'},
                    $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                    $el('div', {className: 'col'}, $el('div', {className: 'cell'}, this.day))
                )
            );
        }
    }
    /*
     * Headerline week-muodossa.
     */
    class WeekHeader extends Inferno.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
            this.DAYS = getFormattedWeekDays(
                Intl.DateTimeFormat('fi', {weekday: 'short'})
            );
        }
        /**
         * Renderöi 1 * 2 headerlinen
         */
        render() {
            return $el('div', {className: 'header'},
                $el('div', {className: 'fluid'},
                    ([''].concat(this.DAYS)).map(content =>
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, content))
                    )
                )
            );
        }
    }
    /*
     * Headerline month-muodossa.
     */
    class MonthHeader extends Inferno.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
            this.DAYS = getFormattedWeekDays(
                Intl.DateTimeFormat('fi', {weekday: 'long'})
            );
        }
        /**
         * Renderöi 1 * 2 headerlinen
         */
        render() {
            return $el('div', {className: 'header'},
                $el('div', {className: 'fluid'},
                    this.DAYS.map(weekDay =>
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, weekDay))
                    )
                )
            );
        }
    }
    return {
        [Calendar.views.DAY]: DayHeader,
        [Calendar.views.WEEK]: WeekHeader,
        [Calendar.views.MONTH]: MonthHeader
    };
});
