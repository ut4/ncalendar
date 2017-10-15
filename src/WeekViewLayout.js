import AbstractViewLayout from './AbstractViewLayout.js';
import {ImmutableCell, PlaceholderCell, Cell} from './Content.js';
import Constants from './Constants.js';

/*
 * Kalenterin pääsisältö week, ja week-compact -muodossa.
 */
class WeekViewLayout extends AbstractViewLayout {
    /**
     * Palauttaa 8-sarakkellisen headerin, jossa yksi tyhjä solu tuntisaraketta
     * varten, ja yksi viikonpäiväsolu jokaiselle viikonpäivälle.
     *
     * @access protected
     * @returns {Array}
     */
    getHeaderCells() {
        return [''].concat(this.dateUtils.getFormattedWeekDays(
            this.dateCursor.range.start,
            'short'
        ));
    }
    /**
     * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
     * ja 7 päiväsaraketta. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
     * `mm:ss` wrapattuna ImmutableCell-instanssiin, ja sisältösarakkeen
     * sisältönä aina null wrapattuna Cell-instanssiin.
     *
     * @access protected
     * @param {Object} hoursToDisplay
     * @returns {Array}
     */
    getFullGrid(hoursToDisplay) {
        // Vuorokauden jokaiselle tunnille rivi, ...
        return this.markCurrentDayColumn(this.generateHourRange(hoursToDisplay).map(hour => {
            const rollingDate = new Date(this.dateCursor.range.start);
            rollingDate.setHours(hour);
            // jossa tuntisarake, ...
            const row = [new ImmutableCell(this.dateUtils.formatHour(hour))];
            // ja sarakkeet jokaiselle viikonpäivälle
            while (row.push(new Cell(null, new Date(rollingDate))) <= Constants.DAYS_IN_WEEK) {
                rollingDate.setDate(rollingDate.getDate() + 1);
            }
            return row;
        }));
    }
    /**
     * Generoi viikonpäivien nimet täydellisessä muodossa 2 * 4 taulukkoon
     * Cell-instansseihin wrapattuna.
     *
     * @access protected
     * @returns {Array}
     */
    getCompactGrid() {
        const dayNames = this.dateUtils.getFormattedWeekDays(
            this.dateCursor.range.start,
            'long'
        );
        const rollingDate = new Date(this.dateCursor.range.start);
        const getDateAndMoveToNexDay = () => {
            const d = new Date(rollingDate);
            rollingDate.setDate(rollingDate.getDate() + 1);
            return d;
        };
        return this.markCurrentDayColumn([
            [
                new Cell(dayNames[0], getDateAndMoveToNexDay()),
                new Cell(dayNames[1], getDateAndMoveToNexDay())
            ], [
                new Cell(dayNames[2], getDateAndMoveToNexDay()),
                new Cell(dayNames[3], getDateAndMoveToNexDay())
            ], [
                new Cell(dayNames[4], getDateAndMoveToNexDay()),
                new Cell(dayNames[5], getDateAndMoveToNexDay())
            ], [
                new Cell(dayNames[6], getDateAndMoveToNexDay()),
                new PlaceholderCell(null, null)
            ]
        ], true);
    }
    /**
     * Luo asetuksissa määritellystä hours-arvosta range-taulukon. esim.
     * {first: 8, last: 16} -> [8,9,...,15,16]
     *
     * @access protected
     */
    generateHourRange(hoursToDisplay) {
        let hours = [];
        for (let hour = hoursToDisplay.first; hour <= hoursToDisplay.last; hour++) {
            hours.push(hour);
        }
        return hours;
    }
    /**
     * Asettaa kuluvalle päivälle kuuluvien Cell-instanssien
     * isCurrentDay -> true.
     *
     * @access private
     */
    markCurrentDayColumn(grid, isCompactView) {
        const now = new Date();
        // range == kuluva viikko?
        if (this.dateUtils.getStartOfWeek(now).toDateString() ===
            this.dateCursor.range.start.toDateString()) {
            const colIndex = now.getDay() || 7;
            if (!isCompactView) {
                grid.forEach(row => { row[colIndex].isCurrentDay = true; });
            } else {
                grid[Math.round(colIndex / 2) - 1][!(colIndex % 2) ? 1 : 0].isCurrentDay = true;
            }
        }
        return grid;
    }
}

export default WeekViewLayout;
