import EventExtension from '../../src/event/EventExtension.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';

QUnit.module('event/EventExtension', function() {
    QUnit.test('construct luo repositoryn settings-objektin perusteella', assert => {
        const settings = {repository: 'memory', defaultEvents: [{start: new Date(), title: 'foo'}]};
        const extension = new EventExtension(null);
        extension.initialize(settings);
        const constructedRepository = extension.repository;
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
