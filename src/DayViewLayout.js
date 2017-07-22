import AbstractViewLayout from './AbstractViewLayout.js';
import {HOURS_ARRAY, ImmutableCell, Cell} from './Content.js';
import Constants from './Constants.js';

/*
 * Kalenterin pääsisältö day-muodossa.
 */
class DayViewLayout extends AbstractViewLayout {
    getName() {
        return Constants.VIEW_DAY;
    }
    /**
     * Day-näkymällä ei ole erillistä compact-muotoa.
     *
     * @access protected
     * @returns {Array}
     */
    getCompactLayout() {
        return this.getFullLayout();
    }
    /**
     * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
     * ja yksi päiväsarake. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
     * `mm:ss` wrapattuna ImmutableCell-instanssiin, ja sisältösarakkeen
     * sisältönä aina null wrapattuna Cell-instanssiin.
     *
     * @access protected
     * @returns {Array}
     */
    generateFullGrid() {
        const rollingDate = new Date(this.dateCursor.range.start);
        const isToday = rollingDate.toDateString() === new Date().toDateString();
        // Päivän jokaiselle tunnille rivi, ...
        return HOURS_ARRAY.map(hour => {
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
