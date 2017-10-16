import RepositoryFactory from '../../src/event/RepositoryFactory.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';
import HttpEventRepository from '../../src/event/HttpEventRepository.js';
import Event from '../../src/event/Event.js';

const someEvent = {id: 1, start: new Date(), title: 'Fus'};

QUnit.module('event/RepositoryFactories', function(hooks) {
    hooks.beforeEach(() => {
        this.repositoryFactory = new RepositoryFactory();
    });
    QUnit.test('make failaa, jos repositoryä ei löydy', assert => {
        assert.throws(
            () => this.repositoryFactory.make('rt', {asd: 'er'}),
            'Pitäisi heittää poikkeus, jos repositoryä ei löydy'
        );
    });
    QUnit.test('make({repository: \'memory\') luo uuden InMemoryEventRepositoryn', assert => {
        const withDefaults = this.repositoryFactory.make('memory');
        const withProvided = this.repositoryFactory.make('memory', {eventRepositoryDefaultEvents: [someEvent]});
        //
        assert.ok(withDefaults instanceof InMemoryEventRepository, 'Pitäisi luoda InMemoryEventRepository');
        assert.deepEqual(withDefaults.events, [], 'Pitäisi passata oletukseventeiksi []');
        assert.ok(withProvided instanceof InMemoryEventRepository, 'Pitäisi luoda InMemoryEventRepository');
        assert.deepEqual(withProvided.events, [new Event(someEvent)], 'Pitäisi passata settings.eventRepositoryDefaultEvents oletuseventeiksi');
    });
    QUnit.test('make({repository: \'memory\') failaa, jos settings.eventRepositoryDefaultEvents ei ole validi', assert => {
        assert.throws(
            () => this.repositoryFactory.make('memory', {eventRepositoryDefaultEvents: 'bogus'}),
            'Pitäisi heittää poikkeus, jos settings.eventRepositoryDefaultEvents ei ole taulukko'
        );
    });
    QUnit.test('make({repository: \'http\') luo uuden HttpEventRepositoryn', assert => {
        const withDefaults = this.repositoryFactory.make('http');
        const settings = {repository: 'http', eventRepositoryFetchFn: url => url, eventRepositoryBaseUrl: 'http://sd'};
        const withProvided = this.repositoryFactory.make(settings.repository, settings);
        //
        assert.ok(withDefaults instanceof HttpEventRepository, 'Pitäisi luoda HttpEventRepository');
        assert.equal(typeof withDefaults.http.fetch, 'function', 'Pitäisi asettaa oletus-eventRepositoryFetchFn');
        assert.deepEqual(withDefaults.http.eventRepositoryBaseUrl, undefined, 'Ei pitäisi asettaa oletus-baseUrliksi mitään');
        assert.ok(withProvided instanceof HttpEventRepository, 'Pitäisi luoda HttpEventRepository');
        assert.deepEqual(withProvided.http.fetch, settings.eventRepositoryFetchFn, 'Pitäisi asettaa settings.eventRepositoryFetchFn');
        assert.deepEqual(withProvided.http.baseUrl, settings.eventRepositoryBaseUrl, 'Pitäisi asettaa settings.eventRepositoryBaseUrl');
    });
    QUnit.test('make({repository: \'http\') failaa, jos settings.eventRepositoryFetchFn|eventRepositoryBaseUrl ei ole validi', assert => {
        assert.throws(
            () => this.repositoryFactory.make({repository: 'http', eventRepositoryFetchFn: 'bogus'}),
            'Pitäisi heittää poikkeus, jos settings.eventRepositoryFetchFn ei ole funktio'
        );
        assert.throws(
            () => this.repositoryFactory.make({repository: 'http', eventRepositoryBaseUrl: {bog: 'us'}}),
            'Pitäisi heittää poikkeus, jos settings.eventRepositoryBaseUrl ei ole merkkijono'
        );
    });
});
