import nullcalendar from './main.js';

const now = new Date();
const defaultEvents = [
    {start: new Date(now.getFullYear(), now.getMonth(), now.getDate()-2, 10, 0, 0, 0), title: 'Event 1'},
    {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 1), title: 'Event 2'},
    {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30, 0, 0), title: 'Event 3'}
].map((ev, i) => {
    ev.end = new Date(ev.start);
    ev.end.setHours(ev.end.getHours() + i + 1);
    return ev;
});

nullcalendar.newCalendar(document.getElementById('cal'), {
    extensions: ['event'],
    eventRepository: 'memory',
    eventRepositoryDefaultEvents: defaultEvents
});
