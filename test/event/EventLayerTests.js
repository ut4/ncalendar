import EventLayer from '../../src/event/EventLayer.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';

const fakeCalendarController = {dateCursor: {range: {}}};

QUnit.module('event/EventLayer', function() {
    QUnit.test('construct luo repositoryn settings-objektin perusteella', assert => {
        const settings = {repository: 'memory', defaultEvents: [{date: new Date(), title: 'foo'}]};
        const constructedRepository = new EventLayer(settings, null, null).repository;
        //
        assert.ok(constructedRepository instanceof InMemoryEventRepository,
            'Pitäisi luoda settings.repository:yn määritelty repository'
        );
        assert.deepEqual(constructedRepository.events, settings.defaultEvents,
            'Pitäisi passata memory-repositorylle defaultEvents:t'
        );
    });
    QUnit.test('load normalisoi repositoryn palauttamat eventit', assert => {
        const repository = new InMemoryEventRepository();
        const eventLayer = new EventLayer(repository, null, fakeCalendarController);
        const someEvents = [
            {date: (new Date()).getTime()},
            {date: (new Date()).toISOString()}
        ];
        sinon.stub(repository, 'getAll').returns(Promise.resolve(someEvents));
        //
        const done = assert.async();
        eventLayer.load().then(() => {
            assert.ok(
                eventLayer.events.every(ev => ev.date instanceof Date),
                'Pitäisi muuntaa jokaisen event.daten tyypiksi Date'
            );
            done();
        });
    });
});
