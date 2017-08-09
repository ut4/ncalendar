import Content from '../../src/Content.js';
import CalendarLayout from '../../src/CalendarLayout.js';
import EventLayer from '../../src/event/EventLayer.js';
import ContentLayerFactory from '../../src/ContentLayerFactory.js';
import {arrayUtils} from '../resources/utils.js';

new ContentLayerFactory().register('event', EventLayer);
const d = new Date(2017, 7, 7);

QUnit.module('event/WeekViewEventStacking', function (hooks) {
    function render(defaultEvents) {
        return ReactTestUtils.renderIntoDocument(
            $el(CalendarLayout, {
                initialDate: new Date(d),
                contentLayers: [{name: 'event', args: (a, b) =>
                    [{repository: 'memory', defaultEvents}, a, b]
                }]
            })
        );
    }
    hooks.beforeEach(() => {
        this.contentLoadCallSpy = sinon.spy(Content.prototype, 'loadAsyncContent');
    });
    hooks.afterEach(() => {
        this.contentLoadCallSpy.restore();
    });
    QUnit.test('Renderöi eventit oikean pituisina, sekä asettaa stackIndex:n arvoksi 0, jos eventit ei mene päällekäin', assert => {
        const rendered = render(arrayUtils.shuffle([
            {
                // Vain 1. rivi (tunnin pituinen)
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                id: 1
            },
            // Ei rivejä välissä
            {
                // Rivit 1 & 2 (2 tuntiä pitkä)
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0, 0, 0),
                id: 2
            },
            // Välissä yksi tyhjä rivi
            {
                // Rivit 4 & 5 & 6 (3 tuntia pitkä)
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 0, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0, 0),
                id: 3
            }
        ]));
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const mainGrid = ReactTestUtils.findRenderedDOMComponentWithClass(rendered, 'main');
            const renderedEvents = getRenderedEvents(rendered);
            // 1. event pitäisi renderöityä rivin pituiseksi
            // -----------------------------------------------------------------
            const firstEventParts = renderedEvents[0];
            assert.equal(firstEventParts.length, 1, 'Pitäisi olla 1 riviä korkea');
            assert.ok(firstEventParts[0].classList.contains('incontinous'),
                'Alle tunnin pituinen event pitäisi olla merkitty luokalla "incontinous"'
            );
            // 2. event pitäisi renderöityä kahden rivin pituiseksi
            // -----------------------------------------------------------------
            const secondEventParts = renderedEvents[1];
            assert.equal(secondEventParts.length, 2, 'Pitäisi olla 2 riviä korkea');
            assert.notOk(secondEventParts[0].classList.contains('incontinous'));
            const continuedSecondHour = secondEventParts[1];
            assert.notDeepEqual(continuedSecondHour.parentNode, getNthGridSlot(mainGrid, 1, 1),
                'Event pitäisi jatkua seuraavalla rivillä'
            );
            assert.ok(continuedSecondHour.classList.contains('ongoing-end'));
            // 3. event pitäisi renderöityä kolmen rivin pituiseksi
            // -----------------------------------------------------------------
            const thirdEventParts = renderedEvents[2];
            assert.equal(thirdEventParts.length, 3, 'Pitäisi olla 2 riviä korkea');
            const middlePart = thirdEventParts[1];
            const lastPart = thirdEventParts[2];
            assert.notDeepEqual(middlePart.parentNode, getNthGridSlot(mainGrid, 4, 1),
                'Event pitäisi jatkua seuraavalla rivillä'
            );
            assert.notOk(middlePart.classList.contains('ongoing-end'));
            assert.notDeepEqual(lastPart.parentNode, getNthGridSlot(mainGrid, 5, 1),
                'Event pitäisi jatkua seuraavalla rivillä'
            );
            assert.ok(lastPart.classList.contains('ongoing-end'));
            // Assertoi stackIndeksit
            assert.equal(
                renderedEvents.reduce((a,b) => a.concat(b), []).map(el =>
                    el.className.match(/stack-index-[0-9]/)[0]
                ).join(''),
                'stack-index-0'.repeat(1 + 2 + 3),
                'Kaikkien eventien kaikkien osien stackIndex pitäisi olla 0'
            );
            done();
        });
    });
    QUnit.test('Asettaa >0 stackIndeksit päällekäin meneville eventeille', assert => {
        const rendered = render(arrayUtils.shuffle([
            {
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                id: 1
            },
            // Samassa solussa toinen eventi
            {
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 30, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                id: 2
            },
            {
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 2, 0, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 0, 0, 0),
                id: 3
            },
            // Uusi event ennen kuin ylempi loppuu..
            {
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 6, 0, 0, 0),
                id: 4
            },
            // Uusi event ennen kuin ylempi loppuu..
            {
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 0, 0, 0),
                dateTo: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0, 0),
                id: 5
            }
        ]));
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = getRenderedEvents(rendered);
            assert.ok(renderedEvents[0][0].classList.contains('incontinous'),
                'Alle tunnin pituinen event pitäisi olla merkitty luokalla "incontinous"'
            );
            assert.ok(renderedEvents[0][0].className.match(/stack-index-[0-9]/)[0], 'stack-index-0');
            assert.ok(renderedEvents[1][0].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.ok(renderedEvents[2][0].className.match(/stack-index-[0-9]/)[0], 'stack-index-0');
            assert.ok(renderedEvents[2][1].className.match(/stack-index-[0-9]/)[0], 'stack-index-0');
            assert.ok(renderedEvents[3][0].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.ok(renderedEvents[3][1].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.ok(renderedEvents[3][2].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.ok(renderedEvents[4][0].className.match(/stack-index-[0-9]/)[0], 'stack-index-2');
            assert.ok(renderedEvents[4][1].className.match(/stack-index-[0-9]/)[0], 'stack-index-2');
            assert.ok(renderedEvents[4][2].className.match(/stack-index-[0-9]/)[0], 'stack-index-2');
            done();
        });
    });
});
/**
 * @returns {Array} esim. [
 *     <div class="event">,
 *     <div class="event-ongoing end"
 * ], [
 *     <div class="event incontinous">
 * ], [
 *     <div class="event">,
 *     <div class="event-ongoing">,
 *     <div class="event-ongoing end">
 * ]
 */
function getRenderedEvents(rendered) {
    const continuations = ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'event-ongoing');
    return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'event').map((event, i) =>
        [event].concat(continuations.filter(c =>
            c.getAttribute('partof') == (i + 1)
        ))
    );
}
function getNthGridSlot(mainGrid, row, col) {
    //                 .row           .col             div
    return mainGrid.children[row].children[1 + col].children[0];
}