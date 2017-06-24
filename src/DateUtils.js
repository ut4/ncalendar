define(() => {
    'use strict';
    const EMPTY_WEEK = Array.from(Array(7));
    class DateUtils {
        getEstimatedFirstDayOfWeek() {
            // Kesäkuun ensimmäinen maanantai, 2017, klo 12:00:00
            return (new Date(2017, 5, 5, 12, 0, 0, 0)).getDay();
        }
        getStartOfWeek(date) {
            const firstDay = this.getEstimatedFirstDayOfWeek();
            const d = new Date(date);
            d.setDate(date.getDate() - (7 + date.getDay() - firstDay) % 7);
            return d;
        }
        getFormattedWeekDays(date, format) {
            const d = this.getStartOfWeek(date);
            return EMPTY_WEEK.map(() => {
                const formatted = format.format(d);
                d.setDate(d.getDate() + 1);
                return formatted;
            });
        }
        getStartOfDay(date) {
            const start = new Date(date);
            start.setHours(0);
            start.setMinutes(0);
            start.setSeconds(0);
            start.setMilliseconds(1);
            return start;
        }
        getEndOfDay(date) {
            const end = new Date(date);
            end.setHours(23);
            end.setMinutes(59);
            end.setSeconds(59);
            end.setMilliseconds(999);
            return end;
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