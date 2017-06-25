require(['nullcalendar', 'src/event/EventLayer'], (nullcalendar, EventLayer) => {
    'use strict';
    nullcalendar.registerContentLayer('event', EventLayer.default);
    nullcalendar.newCalendar(document.getElementById('cal'),
        {settings: {contentLayers: ['event']}}
    );
});