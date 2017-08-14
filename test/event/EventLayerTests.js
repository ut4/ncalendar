import EventLayer from '../../src/event/EventLayer.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';

const fakeCalendarController = {dateCursor: {range: {}}};

QUnit.module('event/EventLayer', function() {
    QUnit.test('construct luo repositoryn settings-objektin perusteella', assert => {
        const settings = {repository: 'memory', defaultEvents: [{start: new Date(), title: 'foo'}]};
        const constructedRepository = new EventLayer(settings, null, null).repository;
        //
        assert.ok(constructedRepository instanceof InMemoryEventRepository,
            'Pitäisi luoda settings.repository:yn määritelty repository'
        );
        assert.deepEqual(
            [{
                start: constructedRepository.events[0].start,
                title: constructedRepository.events[0].title,
            }],
            settings.defaultEvents,
            'Pitäisi passata memory-repositorylle defaultEvents:t'
        );
    });
    QUnit.test('load normalisoi repositoryn palauttamat eventit', assert => {
        const repository = new InMemoryEventRepository();
        const eventLayer = new EventLayer(repository, null, fakeCalendarController);
        const someEvents = [
            {start: (new Date()).getTime(), end: (new Date()).getTime() + 1, id: 'fo'},
            {start: (new Date()).toISOString()}
        ];
        sinon.stub(repository, 'getAll').returns(Promise.resolve(someEvents));
        //
        const done = assert.async();
        eventLayer.load().then(() => {
            assert.ok(eventLayer.events.every(ev => ev.start instanceof Date),
                'Pitäisi muuntaa jokaisen event.startin tyypiksi Date'
            );
            assert.ok(eventLayer.events[0].end instanceof Date,
                'Pitäisi muuntaa event.end tyypiksi Date'
            );
            assert.ok(eventLayer.events[1].end instanceof Date,
                'Pitäisi asettaa end, jos sitä ei ole määritelty'
            );
            assert.ok(eventLayer.events[1].hasOwnProperty('id'),
                'Pitäisi asettaa eventille id, jos ei ole valmiiksi'
            );
            assert.equal(eventLayer.events.map(e => e.stackIndex).join(), '0,0',
                'Pitäisi asettaa eventien stackIndex-arvoksi 0'
            );
            done();
        });
    });
});
