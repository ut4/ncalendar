define(['src/Constants', 'src/ioc'], (Constants, ioc) => {
    'use strict';
    const dateUtils = ioc.default.dateUtils();
    /*
     * Kalenterin toolbarin alapuolelle renderöitävä headerline day-muodossa.
     *  ___________________________
     * |__________Toolbar__________|
     * |______--> Header <--_______|
     * |                           |
     * |         Content           |
     * |___________________________|
     */
    class DayHeader extends React.Component {
        /**
         * @param {object} props {dateCursor: {DateCursor}}
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 1 * 2 headerlinen
         *
         * @access private
         */
        render() {
            return $el('div', {className: 'header'},
                $el('div', {className: 'row'},
                    $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                    $el('div', {className: 'col'}, $el('div', {className: 'cell'}, this.formatDay(this.props.dateCursor.range.start)))
                )
            );
        }
        /**
         * Palauttaa {cursorStart} Date-objektista täydellisen viikonpäivän
         * nimen.
         *
         * @access private
         * @param {Date} cursorStart
         * @returns {string}
         */
        formatDay(cursorStart) {
            return Intl.DateTimeFormat('fi', {weekday: 'long'}).format(cursorStart);
        }
    }
    /*
     * Headerline week-muodossa.
     */
    class WeekHeader extends React.Component {
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
                $el('div', {className: 'row'},
                    ([''].concat(this.DAYS)).map(content =>
                        $el('div', {key: content, className: 'col'}, $el('div', {className: 'cell'}, content))
                    )
                )
            );
        }
    }
    /*
     * Headerline month-muodossa.
     */
    class MonthHeader extends React.Component {
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
                $el('div', {className: 'row'},
                    this.DAYS.map(weekDay =>
                        $el('div', {key: weekDay ,className: 'col'}, $el('div', {className: 'cell'}, weekDay))
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
