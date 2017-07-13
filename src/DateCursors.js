define(['src/Constants', 'src/ioc'], (Constants, ioc) => {
    'use strict';
    const dateUtils = ioc.default.dateUtils();
    const isWithinRange = (range, date) => date >= range.start && date <= range.end;
    class DayViewCursorRange {
        constructor(rangeFromPreviousView) {
            if (!DayViewCursorRange.lastRange ||
                !isWithinRange(rangeFromPreviousView, DayViewCursorRange.lastRange.start)) {
                    const baseDate = rangeFromPreviousView.start || new Date();
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
        constructor(rangeFromPreviousView) {
            if (!WeekViewCursorRange.lastRange ||
                !isWithinRange(rangeFromPreviousView, WeekViewCursorRange.lastRange.start)) {
                    const baseDate = rangeFromPreviousView.start || new Date();
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
        constructor(rangeFromPreviousView) {
            const baseDate = rangeFromPreviousView.start || new Date();
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
        constructor(range, subsribeFn) {
            this.range = range;
            saveRangeState(this.range);
            if (subsribeFn) {
                this.subscribe(subsribeFn);
            }
        }
        /**
         * Asettaa {subscribeFn}:n funktioksi, joka triggeröidään jokaisen
         * selaustapahtuman yhteydessä.
         */
        subscribe(subscribeFn) {
            this.notify = subscribeFn;
        }
        /**
         * Siirtää kursoria eteenpäin Calendarin "currentView"-arvosta riippuen
         * 24h, 7pvä tai 1kk.
         */
        next() {
            this.range.goForward();
            saveRangeState(this.range);
            this.notify('next');
        }
        /**
         * Siirtää kursoria taaksepäin Calendarin "currentView"-arvosta riippuen
         * 24h, 7pvä tai 1kk.
         */
        prev() {
            this.range.goBackwards();
            saveRangeState(this.range);
            this.notify('prev');
        }
        /**
         * Siirtää kursorin takaisin nykyhetkeen.
         */
        reset() {
            this.range = new this.range.constructor(new Date());
            this.notify('reset');
        }
        goTo() {
            this.notify('goTo');
        }
    }
    /**
     * Päivittää rangeluokan lastRange -staattisen propertyn.
     */
    function saveRangeState(range) {
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
    const dateCursorFactory = {newCursor: (viewName, rangeFromPreviousView, subscriberFn) => {
        return new DateCursor(new cursorRanges[viewName](rangeFromPreviousView || {}), subscriberFn);
    }};
    return {dateCursorFactory};
});