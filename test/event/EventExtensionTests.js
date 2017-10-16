import EventExtension from '../../src/event/EventExtension.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';

QUnit.module('event/EventExtension', function() {
    QUnit.test('construct luo repositoryn settings-objektin perusteella', assert => {
        const settings = {
            eventRepository: 'memory',
            eventRepositoryDefaultEvents: [{start: new Date(), title: 'foo'}]
        };
        const extension = new EventExtension({settings});
        const constructedRepository = extension.repository;
        //
        assert.ok(constructedRepository instanceof InMemoryEventRepository,
            'Pitäisi luoda repository settings.eventRepository:n perusteella'
        );
        assert.deepEqual(
            [{
                start: constructedRepository.events[0].start,
                title: constructedRepository.events[0].title,
            }],
            settings.eventRepositoryDefaultEvents,
            'Pitäisi passata memory-repositorylle eventRepositoryDefaultEvents:t'
        );
    });
});
