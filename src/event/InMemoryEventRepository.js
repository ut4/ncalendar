class InMemoryEventRepository {
    constructor(events) {
        this.events = events || [];
    }
    /**
     * @access public
     * @param {Object} data
     * @returns {Promise} -> ({Object} newEvent, ei rejektoi)
     */
    insert(data) {
        const newEvent = {title: data.title, date: data.date};
        this.events.push(newEvent);
        return Promise.resolve(newEvent);
    }
    /**
     * @access public
     * @param {Date} from
     * @param {Date} to
     * @returns {Promise} -> ({Array} events|[], ei rejektoi)
     */
    getAll(from, to) {
        return Promise.resolve(this.events.filter(event =>
            event.date >= from && event.date <= to
        ));
    }
    /**
     * @access public
     * @param {Object} event
     * @param {Object} data
     * @returns {Promise} -> ({Object} updatedEvent, ei rejektoi)
     */
    update(event, data) {
        const pos = this.getIndex(event);
        const updatedEvent = Object.assign(event, data);
        this.events[pos] = updatedEvent;
        return Promise.resolve(updatedEvent);
    }
    /**
     * @access public
     * @param {Object} event
     * @returns {Promise} -> ({void} undefined, ei rejektoi)
     */
    delete(event) {
        const pos = this.getIndex(event);
        this.events.splice(pos, 1);
        return Promise.resolve();
    }
    /**
     * @access private
     * @param {Object} event
     * @returns {number}
     * @throws Error
     */
    getIndex(event) {
        const index = this.events.indexOf(event);
        if (index < 0) {
            throw new Error('Event not found.');
        }
        return index;
    }
}

export default InMemoryEventRepository;
