import Event from './Event.js';
import EventModal from './EventModal.js';
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
                this.events = events.map(ev => this.normalizeEvent(ev));
            }, () => {
                this.events = [];
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
        const events = this.collectEvents(cell.date);
        if (events.length) {
            cell.children.push(...events.map(event =>
                this.newEventConstruct(event)
            ));
        }
        cell.clickHandlers.push(() => this.calendarController.openModal(new ComponentConstruct(
            EventModal,
            {event: {title: '', date: new Date(cell.date)}, confirm: data => this.createEvent(data)}
        )));
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
        if (!(event.date instanceof Date)) {
            event.date = new Date(event.date);
        }
        return event;
    }
    /**
     * @access private
     * @return array
     */
    collectEvents(date) {
        if (!this.events) {
            return [];
        }
        return this.calendarController.currentView === Constants.VIEW_MONTH
            ? this.getEventsForMonthDate(date.getDate())
            : this.getEventsForWeekDay(date.getDay(), date.getHours());
    }
    /**
     * Palauttaa filtteröidyt tapahtumat {this.events} -taulukosta.
     *
     * @access private
     * @param {number} date
     */
    getEventsForMonthDate(date) {
        const month = this.calendarController.dateCursor.range.start.getMonth();
        return this.events.filter(event =>
            event.date.getDate() === date &&
            event.date.getMonth() === month
        );
    }
    /**
     * Palauttaa filtteröidyt tapahtumat {this.events} -taulukosta.
     *
     * @access private
     * @param {number} day Viikonpäivä 0-6
     * @param {number} hour Tunti 0-23
     */
    getEventsForWeekDay(day, hour) {
        if (this.calendarController.isCompactViewEnabled &&
            this.calendarController.currentView === Constants.VIEW_WEEK) {
            hour = undefined;
        }
        return this.events.filter(event =>
            event.date.getDay() === day &&
            (hour === undefined || event.date.getHours() === hour)
        );
    }
}

function isValidRepository(obj) {
    return obj && typeof obj.getAll === 'function';
}

export default EventLayer;
