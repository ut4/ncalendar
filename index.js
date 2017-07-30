import nullcalendar from './main.js';

const now = new Date();
const defaultEvents = [
    {date: new Date(now.getFullYear(), now.getMonth(), now.getDate()-2, 4, 0, 0, 0), title: 'Event 1'},
    {date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 1), title: 'Event 2'},
    {date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 30, 0, 0), title: 'Event 3'}
];
// Tapa 1
/*const {EventLayer, RepositoryFactory} = nullcalendar.events;
nullcalendar.registerContentLayer('myevent', (a, b) =>
    new EventLayer(new RepositoryFactory().make('memory', {defaultEvents}), a, b)
);
nullcalendar.newCalendar(document.getElementById('cal'), {contentLayers: ['myevent']});*/
// Tapa 2
nullcalendar.newCalendar(document.getElementById('cal'), {contentLayers: [
    {name: 'event', args: (a, b) => [{repository: 'memory', defaultEvents}, a, b]}
]});
