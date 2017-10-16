import Event from './Event.js';
import EventComponent, { MonthEventComponent } from './EventComponent.js';
import EventModal from './EventModal.js';
import EventCollection from './EventCollection.js';
import { newSplitter } from './EventSplitters.js';
import RepositoryFactory from './RepositoryFactory.js';
import { DropdownSelector, CheckboxSelector } from './Selectors.js';
import ComponentConstruct from '../ComponentConstruct.js';
import { PlaceholderCell } from '../Content.js';
import Constants from '../Constants.js';

/*
 * Tapahtumalaajennos, lisää kalenterisolujen children-taulukkoon {repository}:n
 * löytämät tapahtumat {calendarController.dateCursor.range}:n ajalta.
 */
class EventExtension {
    /**
     * @param {Object} calendarController Kalenterin API
     */
    constructor(calendarController) {
        this.calendar = calendarController;
        const repositorySetting = calendarController.settings.eventRepository;
        this.repository = !isValidRepository(repositorySetting)
            ? new RepositoryFactory().make(repositorySetting, calendarController.settings)
            : repositorySetting;
        /**
         * @prop {Object} key = eventin id, value = stackIndex-arvo
         */
        this.stackIndexes = {};
        /**
         * Funktio, jolla filtteröidään tapahtumat collectEvents-metodissa.
         *
         * @prop {Function=}
         */
        this.filterFn = null;
        /**
         * Toolbariin renderöity valitsin.
         *
         * @prop {DropdownSelector|CheckboxSelector=}
         */
        this.selector = null;
    }
    /**
     * Hakee tapahtumadatan repositorystä ja asettaa ne {this.events}iin.
     *
     * @access public
     */
    load() {
        this.eventSplitter = newSplitter(
            this.calendar.currentView + (this.calendar.isCompactViewEnabled ? '-compact' : ''),
            this.calendar.dateUtils,
            this.calendar.dateCursor
        );
        const range = this.calendar.dateCursor.range;
        return this.repository.getAll(range.start, range.end)
            .then(events => {
                const collection = new EventCollection(...events.map(event => new Event(event)));
                this.selector && this.selector.setSelectables(collection);
                this.events = this.splitAllLongEvents(collection);
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
                `Tällä viikolla ${this.events.filter(e =>
                    e.id.toString().indexOf('-spawning') < 0
                ).length} tapahtumaa`
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
        cell.clickHandlers.push(() => this.calendar.openModal(new ComponentConstruct(
            EventModal,
            {event: new Event({start: new Date(cell.date)}), onConfirm: event => this.createEvent(event)}
        )));
    }
    /**
     * Lisää 'event-categories', ja 'event-tags' toolbarPartFactoryt, jolla
     * voidaan filtteröidä näkymään renderöitäviä eventejä esim. kategorian tai
     * tagien perusteella.
     *
     * @access public
     */
    addToolbarPartFactories(registry) {
        //
        const props = {
            eventExtension: this.calendar.getExtension('event'),
            ref: cmp => { this.selector = cmp; }
        };
        registry.add('event-categories', () => $el(DropdownSelector, props));
        registry.add('event-tags', () => $el(CheckboxSelector, props));
    }
    /**
     * Rekisteröi asetukset eventRepository, eventRepositoryDefaultEvents,
     * eventRepositoryBaseUrl, ja eventRepositoryFetchFn.
     */
    static defineSettings(settingsRegister) {
        settingsRegister.add(
            'eventRepository',
            () => true, // validoidaan myöhemmin
            'memory'
        );
        settingsRegister.add(
            'eventRepositoryDefaultEvents',
            v => !Array.isArray(v) ? '%s tulisi olla taulukko' : true
        );
        settingsRegister.add(
            'eventRepositoryBaseUrl',
            v => typeof v !== 'string' ? '%s tulisi olla merkkijono' : true
        );
        settingsRegister.add(
            'eventRepositoryFetchFn',
            v => typeof v !== 'function' ? '%s tulisi olla funktio' : true
        );
    }
    /**
     * Asettaa dekoroinnin yhteydessä ajettavan lisäfiltterin {filterFn}, ja
     * triggeröi uudelleendekoroinnin.
     *
     * @access public
     */
    applyFilter(filterFn) {
        this.filterFn = filterFn;
        this.calendar.contentController.refresh();
    }
    /**
     * @access protected
     */
    createEvent(event) {
        this.repository.insert(event).then(
            created => {
                this.events.push(created);
                this.events = this.eventSplitter.sort(this.events);
                this.eventSplitter.splitLongEvent(created, spawning => this.events.push(spawning));
                this.calendar.contentController.refresh();
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
                this.eventSplitter.splitLongEvent(updated, spawning => this.events.unshift(spawning));
                this.calendar.contentController.refresh();
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
                this.calendar.contentController.refresh();
            },
            () => {}
        );
    }
    /**
     * @access private
     * @returns {EventCollection}
     */
    splitAllLongEvents(collection) {
        const spawnings = []; // seuraavalle viikolle menevät osuudet
        collection.forEach(event => {
            this.eventSplitter.splitLongEvent(event, spawning => spawnings.push(spawning));
        });
        if (spawnings.length) {
            collection.unshift(...spawnings);
        }
        return this.eventSplitter.sort(collection);
    }
    /**
     * @access private
     */
    newEventConstruct(event) {
        const currentView = this.calendar.currentView;
        return new ComponentConstruct(
            (currentView === Constants.VIEW_MONTH ||
            (currentView === Constants.VIEW_WEEK && this.calendar.isCompactViewEnabled))
                ? MonthEventComponent
                : EventComponent,
            {
                event,
                stackIndex: this.stackIndexes[event.id],
                cellPadding: this.getCellPadding(),
                onEdit: () => {
                    if (event.isSpawning) event = this.getMasterEvent(event);
                    this.calendar.openModal(new ComponentConstruct(
                        EventModal,
                        {
                            event: new Event(event),
                            onDelete: () => this.deleteEvent(event),
                            onConfirm: updated => this.updateEvent(updated, event)
                        }
                    ));
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
        const events = this.calendar.currentView === Constants.VIEW_MONTH
            ? this.events.filterByDate(date.getDate(), this.calendar.dateCursor.range.start.getMonth())
            : this.events.filterByWeekDay(date.getDay(), this.calendar.currentView === Constants.VIEW_DAY ||
                !this.calendar.isCompactViewEnabled ? date.getHours() : null
            );
        return !this.filterFn ? events : events.filter(this.filterFn);
    }
    /**
     * @access private
     * @returns {Array}
     */
    collectOngoingEvents(compareDate) {
        if (!this.events.length) {
            return [];
        }
        return this.calendar.currentView !== Constants.VIEW_MONTH
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
     * Poista eventin splitter.splitLongEvent-metodissa spawnatut osat.
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
            const renderedGrid = this.calendar.contentController.getRenderedGrid();
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

export default EventExtension;
