import Event from './Event.js';
import Constants from '../Constants.js';

/*abstract class Splitter {
    abstract isMultiEvent(event);
    abstract splitLongEvent(event, cb, nthPart = 0);
    abstract sort(events);
}*/

class MonthEventSplitter {
    constructor(dateUtils) {
        this.dateUtils = dateUtils;
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {boolean}
     */
    isMultiEvent(event) {
        const durationInDays = (event.end - event.start) / 1000 / 60 / 60 / 24;
        // Seuraavalle viikolle menevät päiväneljännekset
        return ((event.start.getDay() || 7) + durationInDays - Constants.DAYS_IN_WEEK - 1 > 0.25);
    }
    /**
     * @access public
     * @param {EventCollection} events
     * @returns {EventCollection}
     */
    sort(events) {
        return events.sortByLength();
    }
    /**
     * Katkaiseen eventin useaan osaan, jos sen start ja end on eri viikoilla, ja
     * tarjoilee ne {cb} callbackille. Jos {event} ei tarvitse splittausta,
     * ei tee mitään.
     *
     * @access public
     * @param {Event} event
     * @param {Function} cb Funktio jolle tarjoillaan splitatut osat
     */
    splitLongEvent(event, cb, nthPart = 0) {
        // Seuraavalle viikolle menevät päiväneljännekset
        if (nthPart || this.isMultiEvent(event)) {
            const nextMonday = this.dateUtils.getStartOfWeek(event.start);
            nextMonday.setDate(nextMonday.getDate() + Constants.DAYS_IN_WEEK);
            // Katkaise sunnuntaihin..
            event.hasSpawning = true;
            event.splitEnd = new Date(nextMonday);
            event.splitEnd.setMilliseconds(event.splitEnd.getMilliseconds() - 2);
            // ...jatka maanantaina
            const spawning = new Event(event);
            spawning.isSpawning = true;
            spawning.start = new Date(nextMonday);
            spawning.end = new Date(event.end);
            spawning.id = spawning.id + '-spawning#' + nthPart;
            cb(spawning);
            this.isMultiEvent(spawning) && this.splitLongEvent(spawning, cb, nthPart + 1);
        }
    }
}

class WeekEventSplitter {
    constructor(dateUtils) {
        this.dateUtils = dateUtils;
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {boolean}
     */
    isMultiEvent(event) {
        const durationInHours = (event.end - event.start) / 1000 / 60 / 60;
        // Seuraavalle päivälle menevät tuntineljännekset
        return (event.start.getHours() + durationInHours - Constants.HOURS_IN_DAY > 0.25);
    }
    /**
     * @access public
     * @param {EventCollection} events
     * @returns {EventCollection}
     */
    sort(events) {
        return events.sort((a, b) => a.start > b.start ? 1 : -1);
    }
    /**
     * Katkaiseen eventin useaan osaan, jos sen start ja end on eri päivillä, ja
     * tarjoilee ne {cb} callbackille. Jos {event} ei tarvitse splittausta,
     * ei tee mitään.
     *
     * @access public
     * @param {Event} event
     * @param {Function} cb Funktio jolle tarjoillaan splitatut osat
     */
    splitLongEvent(event, cb, nthPart = 0) {
        // Seuraavalle viikolle menevät päiväneljännekset
        if (nthPart || this.isMultiEvent(event)) {
            const nextDay = this.dateUtils.getStartOfDay(event.start);
            nextDay.setDate(nextDay.getDate() + 1);
            // Katkaise 1ms ennen keskiyötä..
            event.hasSpawning = true;
            event.splitEnd = new Date(nextDay);
            event.splitEnd.setMilliseconds(event.splitEnd.getMilliseconds() - 2);
            // ...jatka 1ms keskiyön jälkeen
            const spawning = new Event(event);
            spawning.isSpawning = true;
            spawning.start = new Date(nextDay);
            spawning.end = new Date(event.end);
            spawning.id = spawning.id + '-spawning#' + nthPart;
            cb(spawning);
            this.isMultiEvent(spawning) && this.splitLongEvent(spawning, cb, nthPart + 1);
        }
    }
}

class DayEventSplitter extends WeekEventSplitter {
    sort(events) {
        return events;
    }
}

/**
 * @param {string} viewName
 * @param {DateUtils} dateUtils
 * @returns {MonthEventSplitter|WeekEventSplitter}
 */
function newSplitter(viewName, dateUtils) {
    const splitterMap = {
        [Constants.VIEW_MONTH]: MonthEventSplitter,
        [Constants.VIEW_WEEK]: WeekEventSplitter,
        [Constants.VIEW_DAY]: DayEventSplitter
    };
    return new splitterMap[viewName](dateUtils);
}

export { newSplitter };
