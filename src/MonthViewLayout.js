import AbstractViewLayout from './AbstractViewLayout.js';
import {Cell, ImmutableCell} from './Content.js';
import Constants from './Constants.js';

/*
 * Kalenterin pääsisältö month, ja month-compact -muodossa
 */
class MonthViewLayout extends AbstractViewLayout {
    /**
     * Palauttaa 8-sarakkellisen headerin, jossa yksi tyhjä solu viikkonumero-
     * saraketta varten, ja yksi viikonpäiväsolu jokaiselle viikonpäivälle.
     *
     * @access protected
     * @returns {Array}
     */
    getHeaderCells() {
        return [''].concat(this.dateUtils.getFormattedWeekDays(
            this.dateCursor.range.start,
            'long'
        ));
    }
    /**
     * Generoi kuukauden päivät numeerisessa muodossa 7 * ~5 taulukkoon Cell-
     * instansseihin wrapattuna. Ensimmäisen rivina alussa, ja viimeisen rivin
     * lopussa voi olla undefined-soluja.
     *
     * @access protected
     * @returns {Array}
     */
    getFullGrid() {
        const d = new Date(this.dateCursor.range.start);
        const currentDayDateStr = new Date().toDateString();
        // Generoi rivit viikonpäiville
        return this.generateGrid(Constants.DAYS_IN_WEEK, d =>
            new Cell(d.getDate(), new Date(d), d.toDateString() === currentDayDateStr)
        // Lisää jokaisen rivi alkuun viikkonumero
        ).map(row => {
            row.unshift(new ImmutableCell(this.dateUtils.getWeekNumber(d)));
            d.setDate(d.getDate() + 7);
            return row;
        });
    }
    /**
     * Generoi kuukauden päivät muodossa `{pvmNumeerinen} + {viikonPäiväLyhyt}`
     * 2 * ~15 taulukkoon Cell-instansseihin wrapattuna.
     *
     * @access protected
     * @returns {Array}
     */
    getCompactGrid() {
        const dayNames = this.dateUtils.getDefaultFormattedWeekDays('short');
        const currentDayDateStr = new Date().toDateString();
        return this.generateGrid(2, d => {
            const dateAndDayName = d.getDate() + ' ' + dayNames[d.getDay()];
            // Lisää viikkonumero ensimmäisen solun-, ja viikon ensimmäisten päivien perään
            return new Cell(d.getDay() !== 1 && d.getDate() > 1
                ? dateAndDayName
                : [dateAndDayName, $el('span', null, ' / Vk' + this.dateUtils.getWeekNumber(d))]
            , new Date(d), d.toDateString() === currentDayDateStr);
        });
    }
    /**
     * Generoi kuukauden kaikki päivät {gridWidth} * {?} taulukkoon. Ensimmäisen
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
        const firstDayOfWeek = this.dateUtils.getFirstDayOfWeek();
        const grid = [];
        let row = [];
        // Lisää ensimmäisen rivin "tyhjät, jos kyseessä Ma-Su grid
        if (gridWidth === Constants.DAYS_IN_WEEK) {
            let emptyCellCount = (startDate.getDay() || 7) - firstDayOfWeek;
            if (emptyCellCount <= 0 && firstDayOfWeek > 1) { emptyCellCount += 7; }
            row.length = emptyCellCount;
            row.fill(undefined);
            if (row.length >= gridWidth) {
                grid.push(row.slice(0, gridWidth));
                row = row.slice(gridWidth);
            }
        }
        // Lisää kuukauden päivät {gridWith} levyisinä riveinä
        while (rollingDate.getMonth() === startDate.getMonth()) {
            row.push(formatFn(rollingDate));
            if (row.length === gridWidth) { grid.push(row); row = []; }
            rollingDate.setDate(rollingDate.getDate() + 1);
        }
        // Tasaa viimeinen rivi
        if (row.length) {
            while (row.push(undefined) < gridWidth) {/**/}
            grid.push(row);
        }
        return grid;
    }
}

export default MonthViewLayout;
