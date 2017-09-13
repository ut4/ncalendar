import Event from './Event.js';

class InMemoryEventRepository {
    constructor(events) {
        this.events = (events || []).map(data => new Event(data));
    }
    /**
     * @access public
     * @param {Event} newEvent
     * @returns {Promise} -> ({Event} newEvent, ei rejektoi)
     */
    insert(newEvent) {
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
            event.end > from && event.start < to
        ));
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {Promise} -> ({Event} event, ei rejektoi)
     */
    update(event) {
        const pos = this.getIndex(event);
        this.events[pos] = event;
        return Promise.resolve(event);
    }
    /**
     * @access public
     * @param {Event} event
     * @returns {Promise} -> ({void} undefined, ei rejektoi)
     */
    delete(event) {
        const pos = this.getIndex(event);
        this.events.splice(pos, 1);
        return Promise.resolve();
    }
    /**
     * @access private
     * @param {Event} event
     * @returns {number}
     * @throws Error
     */
    getIndex(event) {
        for (const ev of this.events) {
            if (ev.id === event.id) {
                return this.events.indexOf(ev);
            }
        }
        throw new Error('Event not found.');
    }
}

export default InMemoryEventRepository;
