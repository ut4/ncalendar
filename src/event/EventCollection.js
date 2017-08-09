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
            event.date.getDay() === weekDay &&
            (typeof hour !== 'number' || event.date.getHours() === hour)
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
            event.date.getDate() === date &&
            event.date.getMonth() === month
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
            event.date.getDay() === weekDay &&
            event.date.getHours() < hour &&
            event.dateTo.getHours() > hour
        );
    }
}

export default EventCollection;
