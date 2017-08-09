class EventCollection extends Array {
    /**
     * @access public
     * @param {number} weekDay 0-6
     * @param {number=} hour 0-23
     * @returns {Array}
     */
    filterByWeekDay(weekDay, hour) {
        if (!this.length) {
            return [];
        }
        return this.filter(event =>
            event.start.getDay() === weekDay &&
            (typeof hour !== 'number' || event.start.getHours() === hour)
        );
    }
    /**
     * @access public
     * @param {number} date 1-31
     * @param {number=} month 0-11
     * @returns {Array}
     */
    filterByDate(date, month) {
        if (!this.length) {
            return [];
        }
        return this.filter(event =>
            event.start.getDate() === date &&
            event.start.getMonth() === month
        );
    }
    /**
     * @access public
     * @param {number} weekDay 0-6
     * @param {number} hour 0-23
     * @returns {Array}
     */
    getOngoingEvents(weekDay, hour) {
        return this.filter(event =>
            event.start.getDay() === weekDay &&
            event.start.getHours() < hour &&
            event.end.getHours() > hour
        );
    }
}

export default EventCollection;
