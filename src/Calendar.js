define(['src/Layout', 'src/Constants', 'src/DateUtils'], (Layout, Constants, DateUtils) => {
    'use strict';
    const dateUtils = new DateUtils.default();
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    class DayViewCursorRange {
        constructor(currentDate) {
            this.start = currentDate;
            this.end = currentDate;
        }
    }
    class WeekViewCursorRange {
        constructor(currentDate) {
            this.start = dateUtils.getStartOfWeek(currentDate);
            this.end = new Date(this.start);
            this.end.setDate(this.end.getDate() + 6);
        }
    }
    class MonthViewCursorRange {
        constructor(currentDate) {
            this.start = new Date(currentDate);
            this.start.setDate(1);
            this.end = new Date(this.start);
            this.end.setMonth(this.end.getMonth() + 1);
            this.end.setDate(0);// 1. pvä - 1 (0) = edellisen kuun viimeinen
        }
    }
    class DateCursor {
        constructor(range) {
            this.range = range;
        }
        move(/*direction*/) {}
        goTo() {}
    }
    const cursorRanges = {
        [Constants.VIEW_DAY]: DayViewCursorRange,
        [Constants.VIEW_WEEK]: WeekViewCursorRange,
        [Constants.VIEW_MONTH]: MonthViewCursorRange
    };
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    const dateCursorFactory = {newDateCursor: viewName => {
        return new DateCursor(new cursorRanges[viewName](new Date()));
    }};
    /*
     * Kalenterin juurikomponentti, ja kirjaston public API.
     */
    class Calendar extends Inferno.Component {
        /**
         * @param {Object} props
         */
        constructor(props) {
            super(props);
            this.state = {
                currentView: Constants.VIEW_DEFAULT,
                dateCursor: dateCursorFactory.newDateCursor(Constants.VIEW_DEFAULT)
            };
        }
        /**
         * Asettaa staten <state.currentView>:in arvoksi <to> (mikäli se ei ole
         * jo valmiiksi), ja alustaa uuden kursorin <state.dateCursor>:iin (mi-
         * käli näkymä vaihtui).
         *
         * @access public
         * @param {string} to Constants.VIEW_DAY | Constants.VIEW_WEEK | Constants.VIEW_MONTH
         */
        changeView(to) {
            const newView = Constants['VIEW_' + to.toUpperCase()];
            if (this.state.currentView === newView) {
                return;
            }
            this.setState({
                currentView: newView//,
                //dateCursor: Calendar.dateCursorFactory.newDateCursor(newView)
            });
        }
        /**
         * Luo layoutin.
         *
         * @access private
         */
        render() {
            return $el(Layout.default, {
                dateCursor: this.state.dateCursor,
                currentView: this.state.currentView,
                changeView: this.changeView.bind(this)
            });
        }
    }
    return {default: Calendar, dateCursorFactory};
});
