import EventLayer from '../../src/event/EventLayer.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';

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
});
