import InMemoryEventRepository from './InMemoryEventRepository.js';
import HttpEventRepository from './HttpEventRepository.js';
import Http from './Http.js';

const factories = {
    memory: ({eventRepositoryDefaultEvents}) => {
        return new InMemoryEventRepository(eventRepositoryDefaultEvents || []);
    },
    http: ({eventRepositoryFetchFn, eventRepositoryBaseUrl}) => {
        return new HttpEventRepository(new Http(eventRepositoryFetchFn, eventRepositoryBaseUrl));
    }
};

class RepositoryFactory {
    /**
     * Luo settings-objektin perusteella uuden repositoryn, tai heittää poikkeuksen
     * jos settings ei ollut validi.
     *
     * @param {string} name esim. 'memory'|'http'
     * @param {Object} args esim. {baseUrl: 'http://foo'}
     * @returns {Object} Uusi repository
     * @throws Error
     */
    make(name, args) {
        const factory = factories[name];
        if (!factory) {
            throw new Error(`${name} ei ole validi repository. Käytettävissä ${
                Object.keys(factories).join(', ')
            }`);
        }
        return factory(args || {});
    }
    // tähän voisi laittaa static addFactory(factory: Function) { factories.push(factory) ... }
}

export default RepositoryFactory;
