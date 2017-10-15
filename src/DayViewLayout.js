import WeekViewLayout from './WeekViewLayout.js';
import {ImmutableCell, Cell} from './Content.js';

/*
 * Kalenterin pääsisältö day-muodossa.
 */
class DayViewLayout extends WeekViewLayout {
    /**
     * Palauttaa 2-sarakkellisen headerin, jossa yksi tyhjä solu tuntisaraketta
     * varten, ja yksi viikonpäiväsolu.
     *
     * @access protected
     * @returns {Array}
     */
    getHeaderCells() {
        return ['', this.dateUtils.format(this.dateCursor.range.start, {weekday: 'long'})];
    }
    /**
     * Day-näkymällä ei ole erillistä compact-muotoa.
     *
     * @access protected
     * @param {Object} hoursToDisplay
     * @returns {Array}
     */
    getCompactLayout(hoursToDisplay) {
        return this.getFullLayout(hoursToDisplay);
    }
    /**
     * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
     * ja yksi päiväsarake. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
     * `mm:ss` wrapattuna ImmutableCell-instanssiin, ja sisältösarakkeen
     * sisältönä aina null wrapattuna Cell-instanssiin.
     *
     * @access protected
     * @param {Object} hoursToDisplay
     * @returns {Array}
     */
    getFullGrid(hoursToDisplay) {
        const rollingDate = new Date(this.dateCursor.range.start);
        const isToday = rollingDate.toDateString() === new Date().toDateString();
        // Päivän jokaiselle tunnille rivi, ...
        return this.generateHourRange(hoursToDisplay).map(hour => {
            rollingDate.setHours(hour);
            // jossa tuntisarake, ja sisältösarake.
            return [
                new ImmutableCell(this.dateUtils.formatHour(hour)),
                new Cell(null, new Date(rollingDate), isToday)
            ];
        });
    }
}

export default DayViewLayout;
