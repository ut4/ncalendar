import Event from './Event.js';
import EventComponent from './EventComponent.js';
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
                this.events = new EventCollection(...events.map(event => new Event(event)));
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
            {event: new Event({start: new Date(cell.date)}), confirm: event => this.createEvent(event)}
        )));
    }
    /**
     * @access protected
     */
    createEvent(event) {
        this.repository.insert(event).then(
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
    updateEvent(event, original) {
        this.repository.update(event).then(
            updated => {
                this.events[this.events.indexOf(original)] = updated;
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
        return new ComponentConstruct(EventComponent, {
            event,
            edit: event => this.calendarController.openModal(new ComponentConstruct(
                EventModal,
                {event: new Event(event), confirm: updated => this.updateEvent(updated, event)}
            )),
            delete: data => this.deleteEvent(data)
        });
    }
    /**
     * Numeerinen arvo (visuaalisesti) limittäisille eventeille. 0 = pinon alin,
     * 1 = pinon 2. kerros jne..
     *
     * @access private
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
