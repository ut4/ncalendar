class EventCollection extends Array {
    /**
     * @access public
     * @param {any} id
     * @returns {Event|undefined}
     */
    findById(id) {
        if (!this.length) {
            return undefined;
        }
        return this.find(event => event.id === id);
    }
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
    getOngoingWeekEvents(weekDay, hour) {
        if (hour < 1) { // yli päivän pituiset eventit ei vielä supported
            return [];
        }
        return this.filter(event =>
            event.start.getDay() === weekDay &&
            event.start.getHours() < hour &&
            event.end.getHours() > hour
        );
    }
    /**
     * @access public
     * @param {number} date 1-31
     * @param {number} month 0-11
     * @returns {Array}
     */
    getOngoingMonthEvents(date, month) {
        return this.filter(event => {
            const end = (event.splitEnd || event.end);
            return event.start.getDate() < date && (
                (end.getDate() > date) ||
                (end.getDate() === date && getMonthEventOverflow(end - event.start) >= 0.25)
            ) && event.start.getMonth() === month;
        });
    }
    /**
     * Pisin ensin.
     *
     * @access public
     * @returns {Array}
     */
    sortByLength() {
        return this.sort((a, b) =>
            (a.splitEnd || a.end) - a.start < (b.splitEnd || b.end) - b.start ? 1 : -1
        );
    }
}

function getMonthEventOverflow(eventDurationMillis) {
    const dayLength = (Math.round(eventDurationMillis / 1000 / 60 / 60 / 24 / 0.25) * 0.25).toFixed(2);
    const digits = dayLength.split('.')[1];
    return digits !== '00' ? parseFloat('0.' + digits) : 0;
}

export default EventCollection;
