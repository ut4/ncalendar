let autoIncrement = 1;

class Event {
    constructor(data) {
        Object.assign(this, data);
        this.id = !data.id ? autoIncrement++ : data.id;
        this.setTitle(data.title);
        this.setStart(data.start);
        this.setEnd(data.end);
    }
    /**
     * @param {string} title
     */
    setTitle(title = '') {
        this.title = title;
    }
    /**
     * @param {Date|number|string|undefined} start Date-objektin konstruktoriin sopiva arvo
     */
    setStart(start) {
        this.start = new Date(start);
    }
    /**
     * @param {Date|number|string|undefined} end Date-objektin konstruktoriin sopiva arvo
     */
    setEnd(end) {
        if (!end) {
            this.end = new Date(this.start);
            this.end.setHours(this.start.getHours() + 1);
        } else {
            this.end = new Date(end);
        }
    }
}

export default Event;
