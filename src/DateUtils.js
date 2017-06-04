define(['src/Calendar'], Calendar => {
    'use strict';
    const EMPTY_WEEK = Array.from(Array(7));
    class DateUtils {
        getStartOfWeek(date) {
            var d = new Date(date);
            var day = d.getDay();
            d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
            return d;
        }
        getFormattedWeekDays(format) {
            const d = this.getStartOfWeek(Calendar.state.dateCursor);
            return EMPTY_WEEK.map(() => {
                const formatted = format.format(d);
                d.setDate(d.getDate() + 1);
                return formatted;
            });
        }
        formatHour(hour) {
            return (hour < 10 ? '0' : '') + hour + ':00';
        }
        format(options, date) {
            return Intl.DateTimeFormat('fi', options).format(date);
        }
    }
    return {default: DateUtils};
});