define(['src/AbstractViewLayout', 'src/Content', 'src/Constants', 'src/DateUtils'], (AbstractViewLayout, Content, Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    /*
     * Kalenterin pääsisältö day-muodossa.
     */
    class DayViewLayout extends AbstractViewLayout.default {
        getName() {
            return Constants.VIEW_DAY;
        }
        /**
         * Day-näkymällä ei ole erillistä mobile-muotoa.
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
         * `mm:ss` wrapattuna Content.ImmutableCell-instanssiin, ja sisältösarakkeen
         * sisältönä aina null wrapattuna Content.Cell-instanssiin.
         *
         * @access protected
         * @returns {Array}
         */
        generateFullGrid() {
            const rollingDate = new Date(this.dateCursor.range.start);
            // Päivän jokaiselle tunnille rivi, ...
            return Content.HOURS_ARRAY.map(hour => {
                rollingDate.setHours(hour);
                // jossa tuntisarake, ja sisältösarake.
                return [
                    new Content.ImmutableCell(dateUtils.formatHour(hour)),
                    new Content.Cell(null, new Date(rollingDate))
                ];
            });
        }
    }
    return {default: DayViewLayout};
});