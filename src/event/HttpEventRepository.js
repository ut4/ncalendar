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
     * @param {Object} data
     * @returns {Promise} -> ({Object} newEvent, ei rejektoi)
     */
    insert(data) {
        const newEvent = {title: data.title, date: data.date};
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
     * @param {Object} event
     * @param {Object} data
     * @returns {Promise} -> ({Object} updatedEvent, ei rejektoi)
     */
    update(event, data) {
        const updated = Object.assign(event, data);
        return this.http.put(event.id.toString(), updated).then(() => updated);
    }
    /**
     * @access public
     * @param {Object} event
     * @returns {Promise} -> ({void} undefined, ei rejektoi)
     */
    delete(event) {
        return this.http.delete(event.id).then(() => undefined);
    }
}

export default HttpEventRepository;
