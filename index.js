import nullcalendar from './main.js';

const now = new Date();
const defaultEvents = [
    {start: new Date(now.getFullYear(), now.getMonth(), now.getDate()-2, 4, 0, 0, 0), title: 'Event 1'},
    {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 1), title: 'Event 2'},
    {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 30, 0, 0), title: 'Event 3'}
].map((ev, i) => {
    ev.end = new Date(ev.start);
    ev.end.setHours(ev.end.getHours() + i + 1);
    return ev;
});

// Tapa 1
/*const {EventLayer, RepositoryFactory} = nullcalendar.events;
nullcalendar.registerContentLayer('myevent', (a, b) =>
    new EventLayer(new RepositoryFactory().make('memory', {defaultEvents}), a, b)
);
nullcalendar.newCalendar(document.getElementById('cal'), {extensions: ['myevent']});*/
// Tapa 2
nullcalendar.newCalendar(document.getElementById('cal'), {extensions: [
    {name: 'event', setup: ext => ext.initialize({repository: 'memory', defaultEvents})}
]});
