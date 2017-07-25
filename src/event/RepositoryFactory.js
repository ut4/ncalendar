import InMemoryEventRepository from './InMemoryEventRepository.js';
import HttpEventRepository from './HttpEventRepository.js';
import Http from './Http.js';

const factories = {
    memory: ({defaultEvents}) => {
        if (defaultEvents && !Array.isArray(defaultEvents)) {
            throw new Error('memory-repositoryn defaultEvents tulisi olla taulukko.');
        }
        return new InMemoryEventRepository(defaultEvents || []);
    },
    http: ({fetchFn, baseUrl}) => {
        if (fetchFn && typeof fetchFn !== 'function') {
            throw new Error('http-repositoryn fetchFn tulisi olla funktio.');
        }
        if (baseUrl && typeof baseUrl !== 'string') {
            throw new Error('http-repositoryn baseUrl tulisi olla merkkijono.');
        }
        return new HttpEventRepository(new Http(fetchFn, baseUrl));
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
