define(['src/Layout', 'src/Constants', 'src/DateUtils'], (Layout, Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    class DayViewCursorRange {
        constructor(currentDate) {
            this.start = dateUtils.getStartOfDay(currentDate);
            this.end = dateUtils.getEndOfDay(currentDate);
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
        constructor(currentDate) {
            this.start = dateUtils.getStartOfWeek(dateUtils.getStartOfDay(currentDate));
            this.end = dateUtils.getEndOfDay(this.start);
            this.end.setDate(this.start.getDate() + 6);
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
        constructor(currentDate) {
            this.start = dateUtils.getStartOfDay(currentDate);
            this.start.setDate(1);
            this.end = dateUtils.getEndOfDay(currentDate);
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
    /**
     * Luokka joka vastaa kalenterin aikakursorin manipuloinnista
     * selaustoimintojen yhteydessä. Kuuluu osaksi Calendar-komponenttia, ja
     * public API:a.
     */
    class DateCursor {
        constructor(range, subsribeFn) {
            this.range = range;
            if (subsribeFn) {
                this.subscribe(subsribeFn);
            }
        }
        /**
         * Asettaa <subscribeFn>:n funktioksi, joka triggeröidään jokaisen
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
            this.notify('next');
        }
        /**
         * Siirtää kursoria taaksepäin Calendarin "currentView"-arvosta riippuen
         * 24h, 7pvä tai 1kk.
         */
        prev() {
            this.range.goBackwards();
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
    const cursorRanges = {
        [Constants.VIEW_DAY]: DayViewCursorRange,
        [Constants.VIEW_WEEK]: WeekViewCursorRange,
        [Constants.VIEW_MONTH]: MonthViewCursorRange
    };
    const dateCursorFactory = {newDateCursor: (viewName, subscriberFn) => {
        return new DateCursor(new cursorRanges[viewName](new Date()), subscriberFn);
    }};
    return {dateCursorFactory};
});