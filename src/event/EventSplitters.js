import Event from './Event.js';
import Constants from '../Constants.js';

/*interface Splitter {
    // Tulisiko tämä event jakaa useaan osaan?
    needsSplitting(event);
    // Mistä kohtaa tämä event tulisi katkaista?
    getSplitPosition(event);
    // Mihin kohtaan katkaistu osa tulisi asettaa? null == ei voi asettaa mihinkään.
    getSpawnPosition(event);
    // Missä järjestyksessä nämä eventit tulisi renderöidä?
    sort(events);
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
    needsSplitting(event) {
        const durationInDays = getEventDurationInDays(event);
        // Seuraavalle viikolle menevät päiväneljännekset
        return ((event.start.getDay() || 7) + durationInDays - Constants.DAYS_IN_WEEK - 1) > 0.25;
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {Date} Eventistä seuraavan viikon maanantai klo 00:00:00
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
    /**
     * @access public
     * @param {Event} event
     * @returns {Date}
     */
    getSpawnPosition(event) {
        return getDefaultSpawnPosition(event);
    }
}

class CompactMonthEventSplitter extends MonthEventSplitter {
    /**
     * @inheritdoc
     */
    needsSplitting(event) {
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
    constructor(dateUtils, hours) {
        this.dateUtils = dateUtils;
        this.hours = hours;
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {boolean}
     */
    needsSplitting(event) {
        const durationInHours = (event.end - event.start) / 1000 / 60 / 60;
        // Seuraavalle päivälle, tai hours-rangen ulkopuolelle menevät tuntineljännekset
        return (event.start.getHours() + durationInHours - this.hours.last > 0.25);
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {Date}
     */
    getSplitPosition(event) {
        const lastRowHour = new Date(event.start);
        lastRowHour.setHours(this.hours.last + 1);
        return lastRowHour;
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
     * Etsii sijoitusposition katkaistulle eventille seuraavalta päivältä, tai
     * palauttaa false, mikäli se ei yltänyt hours.first -ajankohdan yli.
     *
     * @access public
     * @param {Event} event
     * @returns {Date}
     */
    getSpawnPosition(event) {
        const d = new Date(event.splitEnd);
        d.setDate(d.getDate() + 1);
        d.setHours(this.hours.first - 1);
        d.setMilliseconds(d.getMilliseconds() + 2);
        const diff = (event.end - d) / 1000 / 60 / 60;
        return diff > 0.25 ? d : false;
    }
}

class CompactWeekEventSplitter extends WeekEventSplitter {
    /**
     * @inheritdoc
     */
    needsSplitting(event) {
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
    /**
     * @access public
     * @param {Event} event
     * @returns {Date}
     */
    getSpawnPosition(event) {
        return getDefaultSpawnPosition(event);
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
        if (nthPart || this.splitter.needsSplitting(event)) {
            // Katkaise eventin ensimmäinen osa
            event.splitEnd = new Date(this.splitter.getSplitPosition(event));
            event.splitEnd.setMilliseconds(event.splitEnd.getMilliseconds() - 1);
            // Hae tarkempi sijoituskohta eventin toiselle osalle (voi olla eri
            // kuin katkaisukohta viikko-, ja päivänäkymässä).
            const spawnPosition = this.splitter.getSpawnPosition(event);
            // Jos jäi katveeseen (hours.last ja seuraavan päivän hours.first väliin),
            // tai koko rangen ulkopuolelle -> katkaise rekursio.
            if (!spawnPosition ||
                spawnPosition.toISOString().split('T')[0] >
                this.dateCursor.range.end.toISOString().split('T')[0]) {
                return;
            }
            if (nthPart > 39) {
                throw new Error('Jouduin ikuiseen rekursioon t. EventSplitters.splitLongEvent');
            }
            // .. muutoin luo eventin seuraava osa
            const spawning = new Event(event);
            spawning.isSpawning = true;
            spawning.start = new Date(spawnPosition);
            spawning.end = new Date(event.end);
            if (nthPart > 0) { spawning.id = spawning.id.split('-')[0]; }
            spawning.id = spawning.id + '-spawning#' + nthPart;
            delete spawning.splitEnd;
            // Tarjoile callbackille & rekursoi
            cb(spawning);
            this.splitter.needsSplitting(spawning) && this.splitLongEvent(spawning, cb, nthPart + 1);
        }
    }
}

/**
 * @param {Event} event
 * @returns {number}
 */
function getEventDurationInDays(event) {
   return (event.end - event.start) / 1000 / 60 / 60 / 24;
}

/**
 * @param {Event} event
 * @returns {Date}
 */
function getDefaultSpawnPosition(event) {
    const splitPosition = new Date(event.splitEnd);
    splitPosition.setMilliseconds(splitPosition.getMilliseconds() + 2);
    return splitPosition;
}

/**
 * @param {string} viewName
 * @param {DateUtils} dateUtils
 * @param {Object} hours
 * @returns {MonthEventSplitter|WeekEventSplitter}
 */
function newSplitter(viewName, dateUtils, dateCursor, hours) {
    const splitterMap = {
        [Constants.VIEW_MONTH]: MonthEventSplitter,
        [Constants.VIEW_MONTH + '-compact']: CompactMonthEventSplitter,
        [Constants.VIEW_WEEK]: WeekEventSplitter,
        [Constants.VIEW_WEEK + '-compact']: CompactWeekEventSplitter,
        [Constants.VIEW_DAY]: DayEventSplitter,
        [Constants.VIEW_DAY + '-compact']: DayEventSplitter
    };
    return new SplitterDecorator(new splitterMap[viewName](dateUtils, hours), dateCursor);
}

export { newSplitter };
