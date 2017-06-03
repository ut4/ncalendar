define(['src/Calendar'], Calendar => {
    'use strict';
    const DAYS_IN_WEEK = 7;
    const HOURS_IN_DAY = 24;
    const HOURS_ARRAY = Array.from(Array(HOURS_IN_DAY).keys());
    const formatHour = hour => (hour < 10 ? '0' : '') + hour + ':00';
    /*
     * Kalenterin pääsisältö day-muodossa.
     *  ___________________________
     * |__________Toolbar__________|
     * |__________Header___________|
     * |                           |
     * |      --> Content <--      |
     * |___________________________|
     */
    class DayContent extends Inferno.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 24 (tuntia) * 2 (tuntisarake + valittu päivä) gridin.
         */
        render() {
            return $el('div', {className: 'main'},
                HOURS_ARRAY.map(hour =>
                    $el('div', {className: 'fluid'},
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, formatHour(hour))),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, ''))
                    )
                )
            );
        }
    }
    /*
     * Kalenterin pääsisältö week-muodossa.
     */
    class WeekContent extends Inferno.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 24 (tuntia) * 8 (tuntisarake + viikon päivät) gridin.
         */
        render() {
            return $el('div', {className: 'main'},
                HOURS_ARRAY.map(hour =>
                    $el('div', {className: 'fluid'},
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, formatHour(hour))),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, ''))
                    )
                )
            );
        }
    }
    /*
     * Kalenterin pääsisältö month-muodossa.
     */
    class MonthContent extends Inferno.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 4 (viikot) * 7 (viikon päivät) gridin.
         */
        render() {
            return $el('div', {className: 'main'},
                this.generateDateGrid().map(row =>
                    $el(...['div', {className: 'fluid'}].concat(row.map(date =>
                        $el('div', {className: 'col'},
                            $el('div', {className: 'cell'}, date)
                        )
                    )))
                )
            );
        }
        /**
         * Generoi 4 * 7 taulukon, joiden arvoina kuukauden päivä.
         *
         * @returns {Array}
         */
        generateDateGrid() {
            const d = new Date(Calendar.state.dateCursor);
            d.setDate(1);
            const month = d.getMonth();
            const grid = [];
            let row = [];
            do {
                row.push(d.getDate());
                if (row.length === DAYS_IN_WEEK) {
                    grid.push(row);
                    row = [];
                }
                d.setDate(d.getDate() + 1);
            } while (
                d.getMonth() === month ||
                // viimeinen rivi loppuun
                (d.getMonth() !== month && row.length)
            );
            return grid;
        }
    }
    return {
        [Calendar.views.DAY]: DayContent,
        [Calendar.views.WEEK]: WeekContent,
        [Calendar.views.MONTH]: MonthContent
    };
});
