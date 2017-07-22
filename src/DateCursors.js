import Constants from './Constants.js';
import ioc from './ioc.js';

const dateUtils = ioc.dateUtils();
const lastRangeCanBeAdapted = (lastSavedRange, startDateOrRangeOfPreviousView) => (
    // Range täytyy olla ylipäätään tallennettu
    lastSavedRange &&
    // startDateOrRangeOfPreviousView tulee olla Day|Week|MonthViewCursorRange, eikä Date
            !(startDateOrRangeOfPreviousView instanceof Date) &&
    // Tallennettu range ei saa olla liian kaukana edellisen viewin rangesta
            (lastSavedRange.start >= startDateOrRangeOfPreviousView.start &&
            lastSavedRange.start <= startDateOrRangeOfPreviousView.end)
);
class DayViewCursorRange {
    /**
     * @param {Date|WeekViewCursorRange|MonthViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(startDateOrRangeOfPreviousView) {
        if (!lastRangeCanBeAdapted(DayViewCursorRange.lastRange, startDateOrRangeOfPreviousView)) {
            const baseDate = startDateOrRangeOfPreviousView.start || startDateOrRangeOfPreviousView;
            this.start = dateUtils.getStartOfDay(baseDate);
            this.end = dateUtils.getEndOfDay(baseDate);
        } else {
            this.start = DayViewCursorRange.lastRange.start;
            this.end = DayViewCursorRange.lastRange.end;
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
     * @param {Date|DayViewCursorRange|MonthViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(startDateOrRangeOfPreviousView) {
        if (!lastRangeCanBeAdapted(WeekViewCursorRange.lastRange, startDateOrRangeOfPreviousView)) {
            const baseDate = startDateOrRangeOfPreviousView.start || startDateOrRangeOfPreviousView;
            this.start = dateUtils.getStartOfWeek(dateUtils.getStartOfDay(baseDate));
            this.end = dateUtils.getEndOfDay(this.start);
            this.end.setDate(this.start.getDate() + 6);
        } else {
            this.start = WeekViewCursorRange.lastRange.start;
            this.end = WeekViewCursorRange.lastRange.end;
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
     * @param {Date|DayViewCursorRange|WeekViewCursorRange} startDateOrRangeOfPreviousView
     */
    constructor(startDateOrRangeOfPreviousView) {
        const baseDate = startDateOrRangeOfPreviousView.start || startDateOrRangeOfPreviousView;
        this.start = dateUtils.getStartOfDay(baseDate);
        this.start.setDate(1);
        this.end = dateUtils.getEndOfDay(baseDate);
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
/*
 * Luokka, joka vastaa kalenterin aikakursorin manipuloinnista
 * selaustoimintojen yhteydessä. Kuuluu osaksi public calendar-API:a.
 */
class DateCursor {
    constructor(range, subscribeFn) {
        this.range = range;
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
        this.range = new this.range.constructor(new Date());
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
const dateCursorFactory = {newCursor: (viewName, startDateOrRangeFromPreviousView, subscriberFn) => {
    return new DateCursor(new cursorRanges[viewName](startDateOrRangeFromPreviousView || new Date()), subscriberFn);
}};

export {dateCursorFactory};
