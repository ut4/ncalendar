define(() => {
    'use strict';
    const views = {
        DAY: 'day',
        WEEK: 'week',
        MONTH: 'month',
        DEFAULT: 'week'
    };
    const state = {
        dateCursor: new Date()
    };
    return {views: views, state: state};
});
