define(['src/AbstractViewLayout', 'src/Content', 'src/Constants'], (AbstractViewLayout, Content, Constants) => {
    'use strict';
    /*
     * Kalenterin pääsisältö week, ja week-compact -muodossa.
     */
    class WeekViewLayout extends AbstractViewLayout.default {
        getName() {
            return Constants.VIEW_WEEK;
        }
        /**
         * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
         * ja 7 päiväsaraketta. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
         * `mm:ss` wrapattuna Content.ImmutableCell-instanssiin, ja sisältösarakkeen
         * sisältönä aina null wrapattuna Content.Cell-instanssiin.
         *
         * @access protected
         * @returns {Array}
         */
        generateFullGrid() {
            // Vuorokauden jokaiselle tunnille rivi, ...
            return this.markCurrentDayColumn(Content.HOURS_ARRAY.map(hour => {
                const rollingDate = new Date(this.dateCursor.range.start);
                rollingDate.setHours(hour);
                // jossa tuntisarake, ...
                const row = [new Content.ImmutableCell(this.dateUtils.formatHour(hour))];
                // ja sarakkeet jokaiselle viikonpäivälle
                while (row.push(new Content.Cell(null, new Date(rollingDate))) <= Constants.DAYS_IN_WEEK) {
                    rollingDate.setDate(rollingDate.getDate() + 1);
                }
                return row;
            }));
        }
        /**
         * Generoi viikonpäivien nimet täydellisessä muodossa 2 * 4 taulukkoon
         * Content.Cell-instansseihin wrapattuna.
         *
         * @access protected
         * @returns {Array}
         */
        generateCompactGrid() {
            const dayNames = this.dateUtils.getFormattedWeekDays(
                this.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'long'})
            );
            const rollingDate = new Date(this.dateCursor.range.start);
            const getDateAndMoveToNexDay = () => {
                const d = new Date(rollingDate);
                rollingDate.setDate(rollingDate.getDate() + 1);
                return d;
            };
            return this.markCurrentDayColumn([
                [
                    new Content.Cell(dayNames[0], getDateAndMoveToNexDay()),
                    new Content.Cell(dayNames[1], getDateAndMoveToNexDay())
                ], [
                    new Content.Cell(dayNames[2], getDateAndMoveToNexDay()),
                    new Content.Cell(dayNames[3], getDateAndMoveToNexDay())
                ], [
                    new Content.Cell(dayNames[4], getDateAndMoveToNexDay()),
                    new Content.Cell(dayNames[5], getDateAndMoveToNexDay())
                ], [
                    new Content.Cell(dayNames[6], getDateAndMoveToNexDay()),
                    new Content.PlaceholderCell(null, null)
                ]
            ], true);
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
    return {default: WeekViewLayout};
});