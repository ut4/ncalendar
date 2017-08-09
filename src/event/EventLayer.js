import Event from './Event.js';
import EventModal from './EventModal.js';
import EventCollection from './EventCollection.js';
import RepositoryFactory from './RepositoryFactory.js';
import ComponentConstruct from '../ComponentConstruct.js';
import {PlaceholderCell} from '../Content.js';
import Constants from '../Constants.js';

/*
 * Tapahtumasisältökerros, lisää kalenterisolujen children-taulukkoon {repository}:n
 * löytämät tapahtumat {calendarController.dateCursor.range}:n ajalta.
 */
class EventLayer {
    /**
     * @param {Object} repositoryOrSettings Luokka, joka tarjoaa & tallentaa tapahtumadatan | configuraatio, jonka perusteella em. luokan voi tehdä
     * @param {Object} contentController Kalenterisisällön API
     * @param {Object} calendarController Kalenterin API
     */
    constructor(repositoryOrSettings, contentController, calendarController) {
        this.repository = !isValidRepository(repositoryOrSettings)
            ? new RepositoryFactory().make(repositoryOrSettings.repository, repositoryOrSettings)
            : repositoryOrSettings;
        this.contentController = contentController;
        this.calendarController = calendarController;
        this.autoIncrement = 1;
    }
    /**
     * Hakee tapahtumadatan repositorystä ja asettaa ne {this.events}iin.
     *
     * @access public
     */
    load() {
        const range = this.calendarController.dateCursor.range;
        return this.repository.getAll(range.start, range.end)
            .then(events => {
                this.events = new EventCollection(...events.map(event => this.normalizeEvent(event)));
                return this.events.length > 0;
            }, () => {
                this.events = new EventCollection();
                return false;
            });
    }
    /**
     * Etsii solulle tapahtumat, ja lisää ne sen .children taulukkoon mikäli
     * niitä löytyi. Lisää solulle clickHandlerin.
     *
     * @access public
     */
    decorateCell(cell) {
        if (cell instanceof PlaceholderCell) {
            cell.children.push(new ComponentConstruct('div', null,
                `Tällä viikolla ${this.events.length} tapahtumaa`
            ));
            return;
        }
        //
        const events = this.collectEvents(cell.date);
        events.length && cell.children.push(...events.map((event, i) => {
            event.stackIndex = this.getStackIndex(event, i);
            return this.newEventConstruct(event);
        }));
        //
        const ongoingEvents = this.collectOngoingEvents(cell.date);
        ongoingEvents.length && cell.children.push(...ongoingEvents.map(event =>
            new ComponentConstruct('div', {
                className: 'event-ongoing stack-index-' + event.stackIndex + (
                    event.end.getHours() - cell.date.getHours() === 1 &&
                    event.start.getDate() === cell.date.getDate() ? ' ongoing-end' : ''
                ),
                partOf: event.id
            })
        ));
        cell.clickHandlers.push(() => this.calendarController.openModal(new ComponentConstruct(
            EventModal,
            {event: {title: '', start: new Date(cell.date)}, confirm: data => this.createEvent(data)}
        )));
    }
    /**
     * Numeerinen arvo (visuaalisesti) limittäisille eventeille. 0 = pinon alin,
     * 1 = pinon 2. kerros jne..
     */
    getStackIndex(event, nth) {
        const hour = event.start.getHours();
        if (hour < 1) {
            return nth;
        }
        for (const ev of this.events.getOngoingEvents(event.start.getDay(), hour)) {
            if (ev.id !== event.id) {
                return (ev.stackIndex || 0) + 1;
            }
        }
        return 0;
    }
    /**
     * @access protected
     */
    createEvent(data) {
        data = this.normalizeEvent(data);
        this.repository.insert(data).then(
            created => {
                this.events.push(created);
                this.contentController.refresh();
            },
            () => {}
        );
    }
    /**
     * @access protected
     */
    updateEvent(event, data) {
        data = this.normalizeEvent(data);
        this.repository.update(event, data).then(
            updated => {
                this.events[this.events.indexOf(event)] = updated;
                this.contentController.refresh();
            },
            () => {}
        );
    }
    /**
     * @access protected
     */
    deleteEvent(event) {
        this.repository.delete(event).then(
            () => {
                this.events.splice(this.events.indexOf(event), 1);
                this.contentController.refresh();
            },
            () => {}
        );
    }
    /**
     * @access private
     */
    newEventConstruct(event) {
        return new ComponentConstruct(Event, {
            event,
            edit: event => this.calendarController.openModal(new ComponentConstruct(
                EventModal,
                {event, confirm: data => this.updateEvent(event, data)}
            )),
            delete: data => this.deleteEvent(data)
        });
    }
    /**
     * @access private
     */
    normalizeEvent(event) {
        if (!(event.start instanceof Date)) {
            event.start = new Date(event.start);
        }
        if (!(event.end instanceof Date)) {
            event.end = new Date(event.end);
        }
        if (!(event.hasOwnProperty('end'))) {
            event.end = new Date(event.start);
            event.end.setHours(event.start.getHours() + 1);
        }
        if (!event.hasOwnProperty('id')) {
            event.id = this.autoIncrement++;
        }
        event.stackIndex = 0;
        return event;
    }
    /**
     * @access private
     * @return array
     */
    collectEvents(date) {
        if (!this.events.length) {
            return [];
        }
        return this.calendarController.currentView === Constants.VIEW_MONTH
            ? this.events.filterByDate(date.getDate(), this.calendarController.dateCursor.range.start.getMonth())
            : this.events.filterByWeekDay(date.getDay(), this.calendarController.currentView === Constants.VIEW_DAY ||
                !this.calendarController.isCompactViewEnabled ? date.getHours() : null
            );
    }
    /**
     * @access private
     * @return array
     */
    collectOngoingEvents(date) {
        if (!this.events.length) {
            return [];
        }
        return this.calendarController.currentView === Constants.VIEW_MONTH
            ? [] // TODO implement
            : this.events.getOngoingEvents(date.getDay(), date.getHours());
    }
}

function isValidRepository(obj) {
    return obj && typeof obj.getAll === 'function';
}

export default EventLayer;
