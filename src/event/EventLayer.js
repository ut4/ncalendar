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
                this.events = this.makeEventCollection(events);
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
                this.events = this.events.sortByLength();
                this.splitLongEvent(created, spawning => this.events.push(spawning));
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
                // Poista nykyiset ylimenevät osat...
                this.clearSpawnings(event);
                // ...ja laske ne uudelleen
                this.splitLongEvent(updated, spawning => this.events.unshift(spawning));
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
                this.clearSpawnings(event);
                this.contentController.refresh();
            },
            () => {}
        );
    }
    /**
     * @access private
     * @returns {EventCollection}
     */
    makeEventCollection(events) {
        const collection = new EventCollection(...events.map(event => new Event(event)));
        const spawnings = []; // seuraavalle viikolle menevät osuudet
        collection.forEach(event => {
            this.splitLongEvent(event, spawning => spawnings.push(spawning));
        });
        if (spawnings.length) {
            collection.unshift(...spawnings);
        }
        return collection.sortByLength();
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
                edit: event => {
                    if (event.isSpawning) event = this.getMasterEvent(event);
                    this.calendarController.openModal(new ComponentConstruct(
                        EventModal,
                        {event: new Event(event), confirm: updated => this.updateEvent(updated, event)}
                    ));
                },
                delete: event => {
                    if (event.isSpawning) event = this.getMasterEvent(event);
                    this.deleteEvent(event);
                }
            }
        );
    }
    /**
     * @access private
     * @returns {Array}
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
     * @returns {Array}
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
     * Numeerinen arvo (visuaalisesti) limittäisille eventeille. 0 = pinon alin,
     * 1 = pinon 2. kerros jne..
     *
     * @access private
     * @returns {number}
     */
    getStackIndex(event, nth) {
        const ongoing = this.collectOngoingEvents(event.start);
        if (!ongoing.length) {
            return nth;
        }
        const last = ongoing.filter(e => e.id !== event.id).pop();
        return this.stackIndexes[last.id] + 1 + nth;
    }
    /**
     * Katkaiseen eventin useaan osaan, jos sen start ja end on eri viikoilla, ja
     * tarjoilee ne {cb} callbackille. Jos {event} ei tarvitse splittausta,
     * ei tee mitään.
     *
     * @access private
     */
    splitLongEvent(event, cb, nthPart = 0) {
        // Seuraavalle viikolle menevät päiväneljännekset
        if (nthPart || isMultiRowEvent(event)) {
            const nextMonday = this.calendarController.dateUtils.getStartOfWeek(event.start);
            nextMonday.setDate(nextMonday.getDate() + Constants.DAYS_IN_WEEK);
            // Katkaise sunnuntaihin..
            event.hasSpawning = true;
            event.splitEnd = new Date(nextMonday);
            event.splitEnd.setMilliseconds(event.splitEnd.getMilliseconds() - 2);
            // ...jatka maanantaina
            const spawning = new Event(event);
            spawning.isSpawning = true;
            spawning.start = new Date(nextMonday);
            spawning.end = new Date(event.end);
            spawning.id = spawning.id + '-spawning#' + nthPart;
            cb(spawning);
            isMultiRowEvent(spawning) && this.splitLongEvent(spawning, cb, nthPart + 1);
        }
    }
    /**
     * Poista eventin splitLongEvent-metodissa spawnatut osat.
     *
     * @access private
     */
    clearSpawnings(event) {
        this.events = this.events.filter(e =>
            e.id.toString().indexOf(event.id + '-spawning') < 0
        );
    }
    /**
     * @access private
     */
    getMasterEvent(spawning) {
        return this.events.findById(parseInt(spawning.id.split('-spawning')[0], 10));
    }
    /**
     * Palauttaa renderöidyn sisältösolun style.paddingTop-arvon. Olettaa, että
     * arvo on yksikköä px.
     *
     * @access private
     * @returns {number}
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

function isMultiRowEvent(event) {
    const durationInDays = (event.end - event.start) / 1000 / 60 / 60 / 24;
    // Seuraavalle viikolle menevät päiväneljännekset
    return ((event.start.getDay() || 7) + durationInDays - Constants.DAYS_IN_WEEK - 1 > 0.25);
}

export default EventLayer;
