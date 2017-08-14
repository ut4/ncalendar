import Http from './Http.js';

class HttpEventRepository {
    /**
     * @param {Object} http {get: {Function}, post: {Function} ...}
     */
    constructor(http) {
        this.http = http || new Http();
    }
    /**
     * @access public
     * @param {Event} data
     * @returns {Promise} -> ({Event} newEvent, ei rejektoi)
     */
    insert(newEvent) {
        return this.http.post('', newEvent).then(insertResponse => {
            newEvent.id = insertResponse.insertId;
            return newEvent;
        });
    }
    /**
     * @access public
     * @param {Date} from
     * @param {Date} to
     * @returns {Promise} -> ({Array} events|[], ei rejektoi)
     */
    getAll(from, to) {
        return this.http.get(
            '?from=' + from.toISOString() + '&to=' + to.toISOString()
        );
    }
    /**
     * @access public
     * @param {Event} updatedEvent
     * @returns {Promise} -> ({Event} updatedEvent, ei rejektoi)
     */
    update(updatedEvent) {
        return this.http.put(updatedEvent.id.toString(), updatedEvent).then(() => updatedEvent);
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {Promise} -> ({void} undefined, ei rejektoi)
     */
    delete(event) {
        return this.http.delete(event.id).then(() => undefined);
    }
}

export default HttpEventRepository;
