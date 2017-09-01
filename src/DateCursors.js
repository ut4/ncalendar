import Constants from './Constants.js';

class DayViewCursorRange {
    /**
     * @param {DateUtils} dateUtils
     * @param {Date|WeekViewCursorRange|MonthViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(dateUtils, startDateOrRangeOfPreviousView) {
        const d = getBasedate(startDateOrRangeOfPreviousView, DayViewCursorRange.lastRange);
        if (d instanceof Date) {
            this.start = dateUtils.getStartOfDay(d);
            this.end = dateUtils.getEndOfDay(d);
        } else {
            this.start = d.start;
            this.end = d.end;
        }
    }
    goForward() {
        this.start.setDate(this.start.getDate() + 1);
        this.end.setDate(this.end.getDate() + 1);
    }
    goBackwards() {
        this.start.setDate(this.start.getDate() - 1);
        this.end.setDate(this.end.getDate() - 1);
    }
}
class WeekViewCursorRange {
    /**
     * @param {DateUtils} dateUtils
     * @param {Date|DayViewCursorRange|MonthViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(dateUtils, startDateOrRangeOfPreviousView) {
        const d = getBasedate(startDateOrRangeOfPreviousView, WeekViewCursorRange.lastRange);
        if (d instanceof Date) {
            this.start = dateUtils.getStartOfWeek(dateUtils.getStartOfDay(d));
            this.end = dateUtils.getEndOfDay(this.start);
            this.end.setDate(this.start.getDate() + 6);
        } else {
            this.start = d.start;
            this.end = d.end;
        }
    }
    goForward() {
        this.start.setDate(this.start.getDate() + Constants.DAYS_IN_WEEK);
        this.end.setDate(this.end.getDate() + Constants.DAYS_IN_WEEK);
    }
    goBackwards() {
        this.start.setDate(this.start.getDate() - Constants.DAYS_IN_WEEK);
        this.end.setDate(this.end.getDate() - Constants.DAYS_IN_WEEK);
    }
}
class MonthViewCursorRange {
    /**
     * @param {DateUtils} dateUtils
     * @param {Date|DayViewCursorRange|WeekViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(dateUtils, startDateOrRangeOfPreviousView) {
        const baseDate = startDateOrRangeOfPreviousView.start || startDateOrRangeOfPreviousView;
        this.start = dateUtils.getStartOfDay(baseDate);
        this.start.setDate(1);
        this.end = dateUtils.getEndOfDay(this.start);
        // https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
        this.end.setMonth(this.start.getMonth() + 1);
        this.end.setDate(0);// 1. pvä - 1 (0) = edellisen kuun viimeinen
    }
    goForward() {
        this.start.setMonth(this.start.getMonth() + 1);
        this.start.setDate(1);
        this.end.setMonth(this.end.getMonth() + 2);
        this.end.setDate(0);
    }
    goBackwards() {
        this.start.setMonth(this.start.getMonth() - 1);
        this.start.setDate(1);
        this.end.setDate(0);
    }
}
function getBasedate(startDateOrRangeOfPreviousView, lastSavedRange) {
    if (startDateOrRangeOfPreviousView instanceof Date) {
        return startDateOrRangeOfPreviousView;
    }
    // Käytä aiemmin tallennettua rangea, jos ei poikkea edellisen näkymän rangesta liikaa
    if (lastSavedRange && isWithinRange(lastSavedRange.start, startDateOrRangeOfPreviousView)) {
        return lastSavedRange;
    }
    const d = new Date();
    // Käytä nykyhetkeä, jos se sattuu edellisen näkymän kanssa samalle viikolle/
    // kuukaudelle, muutoin käytä edellisen näkymän range.start:ia
    return !isWithinRange(d, startDateOrRangeOfPreviousView)
        ? startDateOrRangeOfPreviousView.start
        : d;
}
function isWithinRange(date, range) {
    return (date >= range.start && date <= range.end);
}

/*
 * Luokka, joka vastaa kalenterin aikakursorin manipuloinnista
 * selaustoimintojen yhteydessä. Kuuluu osaksi public calendar-API:a.
 */
class DateCursor {
    constructor(range, dateUtils, subscribeFn) {
        this.range = range;
        this.dateUtils = dateUtils;
        saveRange(this.range);
        if (subscribeFn) {
            this.notify = subscribeFn;
        }
    }
    /**
     * Siirtää kursoria eteenpäin Calendarin "currentView"-arvosta riippuen
     * 24h, 7pvä tai 1kk.
     */
    next() {
        this.range.goForward();
        saveRange(this.range);
        this.notify('next');
    }
    /**
     * Siirtää kursoria taaksepäin Calendarin "currentView"-arvosta riippuen
     * 24h, 7pvä tai 1kk.
     */
    prev() {
        this.range.goBackwards();
        saveRange(this.range);
        this.notify('prev');
    }
    /**
     * Siirtää kursorin takaisin nykyhetkeen.
     */
    reset() {
        this.range = new this.range.constructor(this.dateUtils, new Date());
        saveRange(this.range);
        this.notify('reset');
    }
    goTo() {
        this.notify('goTo');
    }
}
/**
 * Päivittää rangeluokan lastRange -staattisen propertyn.
 */
function saveRange(range) {
    range.constructor.lastRange = {
        start: new Date(range.start),
        end: new Date(range.end)
    };
}
const cursorRanges = {
    [Constants.VIEW_DAY]: DayViewCursorRange,
    [Constants.VIEW_WEEK]: WeekViewCursorRange,
    [Constants.VIEW_MONTH]: MonthViewCursorRange
};

class DateCursorFactory {
    /**
     * @param {DateUtils} dateUtils
     */
    constructor(dateUtils) {
        this.dateUtils = dateUtils;
    }
    /**
     * @param {string} viewName 'day'|'week'|'month'
     * @param {Date|DayViewCursorRange|WeekViewCursorRange|MonthViewCursorRange} startDateOrRangeFromPreviousView
     * @param {Function} subscriberFn
     */
    newCursor(viewName, startDateOrRangeFromPreviousView, subscriberFn) {
        return new DateCursor(
            new cursorRanges[viewName](this.dateUtils, startDateOrRangeFromPreviousView || new Date()),
            this.dateUtils,
            subscriberFn
        );
    }
}

export {DateCursorFactory, DayViewCursorRange, WeekViewCursorRange, MonthViewCursorRange};
