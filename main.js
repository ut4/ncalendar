require(['nullcalendar', 'src/event/InMemoryEventRepository', 'src/event/EventLayer'], (nullcalendar, InMemoryEventRepository, EventLayer) => {
    'use strict';
    // Custom-layeri, joka loggaa duunailujaan consoleen.
    class MyEventLayer extends EventLayer.default {
        constructor() {
            const now = new Date();
            super(new InMemoryEventRepository.default([
                {date: new Date(now.getFullYear(), now.getMonth(), now.getDate()-2, 4, 0, 0, 0), title: 'Event 1'},
                {date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 1), title: 'Event 2'},
                {date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 30, 0, 0), title: 'Event 3'}
            ]), ...arguments);
        }
        load() {
            console.info('Ladataan tapahtumia');
            return super.load();
        }
        decorateCell(cell) {
            console.info('Lisätään tapahtumia soluun');
            return super.decorateCell(cell);
        }
        createEvent(data) {
            console.info('Luodaan tapahtuma', data);
            super.createEvent(data);
        }
        updateEvent(currentEvent, data) {
            console.info('Päivitetään tapahtuma', data);
            super.updateEvent(currentEvent, data);
        }
        deleteEvent(event) {
            console.info('Poistetaan tapahtuma', event);
            super.deleteEvent(event);
        }
    }
    // Rekisteröi layeri, että siihen voidaan viitata settingsin contentLayers-arvossa.
    nullcalendar.registerContentLayer('event', MyEventLayer);
    // Määrittele rekisteröity layeri ladattavaksi.
    nullcalendar.newCalendar(document.getElementById('cal'),
        {settings: {contentLayers: ['event']}}
    );
});