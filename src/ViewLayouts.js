define(['src/DayViewLayout', 'src/WeekViewLayout', 'src/MonthViewLayout', 'src/Constants'], (DayViewLayout, WeekViewLayout, MonthViewLayout, Constants) => {
    'use strict';
    return {
        [Constants.VIEW_DAY]: DayViewLayout.default,
        [Constants.VIEW_WEEK]: WeekViewLayout.default,
        [Constants.VIEW_MONTH]: MonthViewLayout.default
    };
});
