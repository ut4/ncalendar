import Event from './Event.js';
import Constants from '../Constants.js';

/*abstract class Splitter {
    // Tulisiko tämä event jakaa useaan osaan?
    abstract isMultiEvent(event);
    // Mistä kohtaa tämä event tulisi katkaista?
    abstract getSplitPosition(event);
    // Missä järjestyksessä nämä eventit tulisi renderöidä?
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
        const durationInDays = getEventDurationInDays(event);
        // Seuraavalle viikolle menevät päiväneljännekset
        return ((event.start.getDay() || 7) + durationInDays - Constants.DAYS_IN_WEEK - 1) > 0.25;
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {Date} Eventistä seuraavan viikon maanantai klo 00:00:01
     */
    getSplitPosition(event) {
        const nextMonday = this.dateUtils.getStartOfWeek(event.start);
        nextMonday.setDate(nextMonday.getDate() + Constants.DAYS_IN_WEEK);
        return nextMonday;
    }
    /**
     * @access public
     * @param {EventCollection} events
     * @returns {EventCollection}
     */
    sort(events) {
        return events.sortByLength();
    }
}

class CompactMonthEventSplitter extends MonthEventSplitter {
    /**
     * @inheritdoc
     */
    isMultiEvent(event) {
        // Seuraavalle riville menevät päiväneljännekset
        return (getEventDurationInDays(event) - (event.start.getDate() % 2)) > 0.25;
    }
    /**
     * @inheritdoc
     */
    getSplitPosition(event) {
        const firstDayOfNextRow = new Date(event.start);
        const eventStartDate = event.start.getDate();
        firstDayOfNextRow.setDate(eventStartDate + (eventStartDate % 2 ? 2 : 1));
        return firstDayOfNextRow;
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
     * @param {Event} event
     * @returns {Date} Eventistä seuraava päivä klo 00:00:01
     */
    getSplitPosition(event) {
        const nextDay = this.dateUtils.getStartOfDay(event.start);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay;
    }
    /**
     * @access public
     * @param {EventCollection} events
     * @returns {EventCollection}
     */
    sort(events) {
        return events.sort((a, b) => a.start > b.start ? 1 : -1);
    }
}

class CompactWeekEventSplitter extends WeekEventSplitter {
    /**
     * @inheritdoc
     */
    isMultiEvent(event) {
        // Seuraavalle riville menevät päiväneljännekset
        return (getEventDurationInDays(event) - ((event.start.getDay() || 7) % 2 + 1)) > 0.25;
    }
    /**
     * @inheritdoc
     */
    getSplitPosition(event) {
        const firstDayOfNextRow = new Date(event.start);
        firstDayOfNextRow.setDate(event.start.getDate() + ((event.start.getDay() || 7) % 2 + 1));
        return firstDayOfNextRow;
    }
}

class DayEventSplitter extends WeekEventSplitter {
    sort(events) {
        return events;
    }
}

class SplitterDecorator {
    constructor(splitter, dateCursor) {
        this.splitter = splitter;
        this.dateCursor = dateCursor;
    }
    /**
     * @access public
     * @param {EventCollection} events
     * @returns {EventCollection}
     */
    sort(events) {
        return this.splitter.sort(events);
    }
    /**
     * Katkaiseen eventin useaan osaan, jos sen start ja end on eri päivillä/viikoilla,
     * ja tarjoilee ne {cb} callbackille. Jos {event} ei tarvitse splittausta,
     * ei tee mitään.
     *
     * @access public
     * @param {Event} event
     * @param {Function} cb Funktio jolle tarjoillaan splitatut osat
     */
    splitLongEvent(event, cb, nthPart = 0) {
        // Seuraavalle viikolle menevät päiväneljännekset
        if (nthPart || this.splitter.isMultiEvent(event)) {
            const spawningStart = this.splitter.getSplitPosition(event);
            // Katkaise event, keskiyöhön/sunnuntaihin..
            event.hasSpawning = true;
            event.splitEnd = new Date(spawningStart);
            event.splitEnd.setMilliseconds(event.splitEnd.getMilliseconds() - 2);
            // Jos seuraava osa menee rangen ulkopuolelle, vihellä peli poikki
            if (event.splitEnd.toDateString() === this.dateCursor.range.end.toDateString()) {
                return;
            }
            // ...jatka seuraavana päivänä/maanantaina
            const spawning = new Event(event);
            spawning.isSpawning = true;
            spawning.start = new Date(spawningStart);
            spawning.end = new Date(event.end);
            spawning.id = spawning.id + '-spawning#' + nthPart;
            cb(spawning);
            this.splitter.isMultiEvent(spawning) && this.splitLongEvent(spawning, cb, nthPart + 1);
        }
    }
}

/**
 * @access protected
 * @param {Event} event
 * @returns {number}
 */
function getEventDurationInDays(event) {
   return (event.end - event.start) / 1000 / 60 / 60 / 24;
}

/**
 * @param {string} viewName
 * @param {DateUtils} dateUtils
 * @returns {MonthEventSplitter|WeekEventSplitter}
 */
function newSplitter(viewName, dateUtils, dateCursor) {
    const splitterMap = {
        [Constants.VIEW_MONTH]: MonthEventSplitter,
        [Constants.VIEW_MONTH + '-compact']: CompactMonthEventSplitter,
        [Constants.VIEW_WEEK]: WeekEventSplitter,
        [Constants.VIEW_WEEK + '-compact']: CompactWeekEventSplitter,
        [Constants.VIEW_DAY]: DayEventSplitter,
        [Constants.VIEW_DAY + '-compact']: DayEventSplitter
    };
    return new SplitterDecorator(new splitterMap[viewName](dateUtils), dateCursor);
}

export { newSplitter };
