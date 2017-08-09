import Event from './Event.js';
import EventComponent, { MonthEventComponent } from './EventComponent.js';
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
        /**
         * @prop {Object} key = eventin id, value = stackIndex-arvo
         */
        this.stackIndexes = {};
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
            }, () => {
                this.events = new EventCollection();
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
            this.stackIndexes[event.id] = this.getStackIndex(event, i);
            return this.newEventConstruct(event);
        }));
        //
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
        return new ComponentConstruct(
            this.calendarController.currentView !== Constants.VIEW_MONTH ? EventComponent : MonthEventComponent,
            {
                event,
                stackIndex: this.stackIndexes[event.id],
                cellPadding: this.getCellPadding(),
                edit: event => this.calendarController.openModal(new ComponentConstruct(
                    EventModal,
                    {event: new Event(event), confirm: updated => this.updateEvent(updated, event)}
                )),
                delete: data => this.deleteEvent(data)
            }
        );
    }
    /**
     * Numeerinen arvo (visuaalisesti) limittäisille eventeille. 0 = pinon alin,
     * 1 = pinon 2. kerros jne..
     *
     * @access private
     * @returns {number}
     */
    getStackIndex(event, nth) {
        for (const ev of this.collectOngoingEvents(event.start)) {
            if (ev.id !== event.id) {
                return (this.stackIndexes[ev.id] || 0) + 1;
            }
        }
        return nth;
    }
    /**
     * @access private
     * @returns array
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
     * @returns array
     */
    collectOngoingEvents(compareDate) {
        if (!this.events.length) {
            return [];
        }
        return this.calendarController.currentView !== Constants.VIEW_MONTH
            ? this.events.getOngoingWeekEvents(compareDate.getDay(), compareDate.getHours())
            : this.events.getOngoingMonthEvents(compareDate.getDate(), compareDate.getMonth());
    }
    /**
     * Palauttaa renderöidyn sisältösolun style.paddingTop-arvon. Olettaa, että
     * arvo on yksikköä px.
     */
    getCellPadding() {
        if (!this.computedPadding) {
            const renderedGrid = this.contentController.getRenderedGrid();
            if (renderedGrid) {
                //                                  .main        .row        .col        .cell
                const padding = getComputedStyle(renderedGrid.children[0].children[0].children[0]).paddingTop;
                this.computedPadding = parseFloat(padding.replace(/[^0-9\.]/g, ''));// vain numerot, ja .
            } else {
                this.computedPadding = 0;
            }
        }
        return this.computedPadding;
    }
}

function isValidRepository(obj) {
    return obj && typeof obj.getAll === 'function';
}

export default EventLayer;
