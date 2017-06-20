define(['src/AbstractViewLayout', 'src/Content', 'src/Constants', 'src/DateUtils'], (AbstractViewLayout, Content, Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    /*
     * Kalenterin pääsisältö month-muodossa.
     */
    class MonthViewLayout extends AbstractViewLayout.default {
        getName() {
            return Constants.VIEW_MONTH;
        }
        /**
         * Generoi kuukauden päivät numeerisessa muodossa 7 * ~5 taulukkoon Content.Cell-
         * instansseihin wrapattuna. Ensimmäisen rivina alussa, ja viimeisen rivin
         * lopussa voi olla undefined-soluja.
         *
         * @access protected
         * @returns {Array}
         */
        generateFullGrid() {
            return this.generateGrid(Constants.DAYS_IN_WEEK, d =>
                new Content.Cell(d.getDate(), new Date(d))
            );
        }
        /**
         * Generoi kuukauden päivät muodossa `<pvmNumeerinen> + <viikonPäiväLyhyt>`
         * 2 * ~15 taulukkoon Content.Cell-instansseihin wrapattuna.
         *
         * @access protected
         * @returns {Array}
         */
        generateCompactGrid() {
            const dayNames = dateUtils.getFormattedWeekDays(
                this.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'short'})
            );
            return this.generateGrid(2, d => new Content.Cell(
                d.getDate() + ' ' + dayNames[(d.getDay() || 7) - 1], new Date(d)
            ));
        }
        /**
         * Generoi kuukauden kaikki päivät <gridWidth> * <n> taulukkoon. Ensimmäisen
         * rivin alkuun, ja viimeisen rivin loppuun lisätään "tyhjää", jos kuukauden
         * ensimmäinen päivä ei ole maanantai, tai viimeinen sunnuntai (ja {gridWith} = 7).
         * Esimerkkipaluuarvo, jos kuukauden ensimmäinen päivä on keskiviikko;
         * [[undefined, undefined, 1, 2 ...], [6, 7...], ...]. Solujen sisältö
         * määräytyy {formatFn}:n mukaan.
         *
         * @access private
         * @param {number} gridWidth
         * @param {Function} formatFn fn({Date} d || undefined)
         * @returns {Array}
         */
        generateGrid(gridWidth, formatFn) {
            const startDate = this.dateCursor.range.start;
            const rollingDate = new Date(startDate);
            const grid = [];
            let row = [];
            // Lisää ensimmäisen rivin "tyhjät, jos kyseessä Ma-Su grid
            if (gridWidth === Constants.DAYS_IN_WEEK) {
                row.length = (startDate.getDay() || 7) - 1;
                row.fill(undefined);
            }
            // Lisää kuukauden päivät {gridWith} levyisinä riveinä
            while (rollingDate.getMonth() === startDate.getMonth()) {
                row.push(formatFn(rollingDate));
                if (row.length === gridWidth) { grid.push(row); row = []; }
                rollingDate.setDate(rollingDate.getDate() + 1);
            }
            // Tasaa viimeinen rivi
            if (row.length) {
                while (row.push(undefined) < gridWidth);
                grid.push(row);
            }
            return grid;
        }
    }
    return {default: MonthViewLayout};
});