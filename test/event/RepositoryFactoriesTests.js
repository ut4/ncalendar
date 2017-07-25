import RepositoryFactory from '../../src/event/RepositoryFactory.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';
import HttpEventRepository from '../../src/event/HttpEventRepository.js';

const someEvent = {date: new Date(), title: 'Fus'};

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
        const withProvided = this.repositoryFactory.make('memory', {defaultEvents: [someEvent]});
        //
        assert.ok(withDefaults instanceof InMemoryEventRepository, 'Pitäisi luoda InMemoryEventRepository');
        assert.deepEqual(withDefaults.events, [], 'Pitäisi passata oletukseventeiksi []');
        assert.ok(withProvided instanceof InMemoryEventRepository, 'Pitäisi luoda InMemoryEventRepository');
        assert.deepEqual(withProvided.events, [someEvent], 'Pitäisi passata settings.defaultEvents oletuseventeiksi');
    });
    QUnit.test('make({repository: \'memory\') failaa, jos settings.defaultEvents ei ole validi', assert => {
        assert.throws(
            () => this.repositoryFactory.make('memory', {defaultEvents: 'bogus'}),
            'Pitäisi heittää poikkeus, jos settings.defaultEvents ei ole taulukko'
        );
    });
    QUnit.test('make({repository: \'http\') luo uuden HttpEventRepositoryn', assert => {
        const withDefaults = this.repositoryFactory.make('http');
        const settings = {repository: 'http', fetchFn: url => url, baseUrl: 'http://sd'};
        const withProvided = this.repositoryFactory.make(settings.repository, settings);
        //
        assert.ok(withDefaults instanceof HttpEventRepository, 'Pitäisi luoda HttpEventRepository');
        assert.equal(typeof withDefaults.http.fetch, 'function', 'Pitäisi asettaa oletus-fetchFn');
        assert.deepEqual(withDefaults.http.baseUrl, undefined, 'Ei pitäisi asettaa oletus-baseUrliksi mitään');
        assert.ok(withProvided instanceof HttpEventRepository, 'Pitäisi luoda HttpEventRepository');
        assert.deepEqual(withProvided.http.fetch, settings.fetchFn, 'Pitäisi asettaa settings.fetchFn');
        assert.deepEqual(withProvided.http.baseUrl, settings.baseUrl, 'Pitäisi asettaa settings.baseUrl');
    });
    QUnit.test('make({repository: \'http\') failaa, jos settings.fetchFn|baseUrl ei ole validi', assert => {
        assert.throws(
            () => this.repositoryFactory.make({repository: 'http', fetchFn: 'bogus'}),
            'Pitäisi heittää poikkeus, jos settings.fetchFn ei ole funktio'
        );
        assert.throws(
            () => this.repositoryFactory.make({repository: 'http', baseUrl: /bogus/}),
            'Pitäisi heittää poikkeus, jos settings.baseUrl ei ole merkkijono'
        );
    });
});
