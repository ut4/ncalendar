define(['src/Constants', 'src/DateUtils'], (Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
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
         * @param {object} props {dateCursor: {DateCursor}}
         */
        constructor(props) {
            super(props);
            this.day = Intl.DateTimeFormat('fi', {weekday: 'long'}).format(this.props.dateCursor.range.start);
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
            this.DAYS = dateUtils.getFormattedWeekDays(
                this.props.dateCursor.range.start,
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
            this.DAYS = dateUtils.getFormattedWeekDays(
                this.props.dateCursor.range.start,
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
        [Constants.VIEW_DAY]: DayHeader,
        [Constants.VIEW_WEEK]: WeekHeader,
        [Constants.VIEW_MONTH]: MonthHeader
    };
});
