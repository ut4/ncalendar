define(['src/Constants', 'src/DateUtils'], (Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    const HOURS_ARRAY = Array.from(Array(Constants.HOURS_IN_DAY).keys());
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
         * @param {object} props {isMobileViewEnabled: {boolean}, dateCursor: {DateCursor}}
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 2 (tuntisarake + valittu päivä) * 24 (tuntia) gridin.
         */
        render() {
            return $el('div', {className: 'main'},
                HOURS_ARRAY.map(hour =>
                    $el('div', {className: 'fluid'},
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, dateUtils.formatHour(hour))),
                        $el('div', {className: 'col'}, $el('div', {className: 'cell'}, ''))
                    )
                )
            );
        }
    }
    /*
     * Kalenterin pääsisältö week, ja week-mobile -muodossa.
     */
    class WeekContent extends Inferno.Component {
        /**
         * @param {object} props {isMobileViewEnabled: {boolean}, dateCursor: {DateCursor}}
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 8 (tuntisarake + viikonpäivät) * 24 (tuntia) gridin, tai
         * 2 (viikonpäivä) * 4 (rivi) gridin (mobile).
         */
        render() {
            return $el('div', {className: 'main'},
                !this.props.isMobileViewEnabled
                    ? HOURS_ARRAY.map(hour =>
                        $el('div', {className: 'fluid'},
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, dateUtils.formatHour(hour))),
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, ''))
                        )
                    )
                    : this.generateMobileGrid().map(row =>
                        $el('div', {className: 'fluid'}, row.map(content =>
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, $el('span', null, content)))
                        ))
                    )
            );
        }
        /**
         * Generoi viikonpäivät (lyhyessä muodossa) 2 * 4 taulukkoon. Esim.
         * [['Ma', 'Ti'], ['Ke', 'To'], ...].
         *
         * @returns {array}
         */
        generateMobileGrid() {
            const dayNames = dateUtils.getFormattedWeekDays(
                this.props.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'long'})
            );
            return [
                [dayNames[0], dayNames[1]],
                [dayNames[2], dayNames[3]],
                [dayNames[4], dayNames[5]],
                [dayNames[6], 'Tällä viikolla: 0 tapahtumaa'],
            ];
        }
    }
    /*
     * Kalenterin pääsisältö month-muodossa.
     */
    class MonthContent extends Inferno.Component {
        /**
         * @param {object} props {isMobileViewEnabled: {boolean}, dateCursor: {DateCursor}}
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 7 (päivä) * 4 (viikkoa) gridin, tai 2 (päivä + viikonpäivä)
         * * 15 (riviä) gridin (mobile).
         */
        render() {
            return $el('div', {className: 'main'},
                !this.props.isMobileViewEnabled
                    ? this.generateDateGrid().map(row =>
                        $el('div', {className: 'fluid'}, row.map(date =>
                            $el('div', {className: 'col'},
                                $el('div', {className: 'cell'}, date)
                            )
                        ))
                    )
                    : this.generateMobileDateGrid().map(row =>
                        $el('div', {className: 'fluid'}, row.map(content =>
                            $el('div', {className: 'col'}, $el('div', {className: 'cell'}, $el('span', null, content)))
                        ))
                    )
            );
        }
        /**
         * Generoi kuun päivät numeerisessa muodossa 7 * 4 taulukkoon. Esim.
         * [[1, 2 ...], [8, 9...], ...].
         *
         * @returns {Array}
         */
        generateDateGrid() {
            return this.generateGrid(Constants.DAYS_IN_WEEK, d => d.getDate());
        }
        /**
         * Generoi kuun päivät muodossa `<pvmNumeerinen> + <viikonPäiväLyhyt>)
         * 2 * 15 taulukkoon. Esim. [[1 Ma, 2 Ti], [3 Ke ...], ...].
         *
         * @returns {array}
         */
        generateMobileDateGrid() {
            const dayNames = dateUtils.getFormattedWeekDays(
                this.props.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'short'})
            );
            return this.generateGrid(2, d => d.getDate() + ' ' + dayNames[d.getDay()]);
        }
        /**
         * Generoi kuukauden kaikki päivät <gridWidth> * <n> taulukkoon. Taulu-
         * kon sisältö määräytyy <formatFn>:n mukaan.
         *
         * @param {number} gridWidth
         * @param {Function} formatFn fn(d: Date)
         * @returns {array}
         */
        generateGrid(gridWidth, formatFn) {
            const d = new Date(this.props.dateCursor.range.start);
            d.setDate(1);
            const month = d.getMonth();
            const grid = [];
            let row = [];
            do {
                row.push(formatFn(d));
                if (row.length === gridWidth) {
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
        [Constants.VIEW_DAY]: DayContent,
        [Constants.VIEW_WEEK]: WeekContent,
        [Constants.VIEW_MONTH]: MonthContent
    };
});
