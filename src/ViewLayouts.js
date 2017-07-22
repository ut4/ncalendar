import DayViewLayout from './DayViewLayout.js';
import WeekViewLayout from './WeekViewLayout.js';
import MonthViewLayout from './MonthViewLayout.js';
import Constants from './Constants.js';

export default {
    [Constants.VIEW_DAY]: DayViewLayout,
    [Constants.VIEW_WEEK]: WeekViewLayout,
    [Constants.VIEW_MONTH]: MonthViewLayout
};
