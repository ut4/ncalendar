import Content from '../../src/Content.js';
import renderingTestUtils from './renderingTestUtils.js';

const d = new Date(2017, 7, 7);

QUnit.module('event/WeekAndDayViewEventRendering', function (hooks) {
    let contentLoadCallSpy;
    hooks.beforeEach(() => {
        contentLoadCallSpy = sinon.spy(Content.prototype, 'loadAsyncContent');
    });
    hooks.afterEach(() => {
        contentLoadCallSpy.restore();
    });
    QUnit.test('Viikkonäkymä renderöi eventit oikean pituisina, sekä asettaa stackIndex-0 -luokan, jos eventit ei mene limittäin', assert => {
        testRendering('week', assert);
    });
    QUnit.test('Viikkonäkymä asettaa start-minutes & end-minutes -luokat', assert => {
        testMinuteAdjustments('week', assert);
    });
    QUnit.test('Viikkonäkymä asettaa >0 stackIndeksit limittäin meneville eventeille', assert => {
        testStacking('week', assert);
    });
    QUnit.test('Päivänäkymä renderöi eventit oikean pituisina, sekä asettaa stackIndex-0 -luokan, jos eventit ei mene limittäin', assert => {
        testRendering('day', assert);
    });
    QUnit.test('Päivänäkymä asettaa start-minutes & end-minutes -luokat', assert => {
        testMinuteAdjustments('day', assert);
    });
    QUnit.test('Päivänäkymä asettaa >0 stackIndeksit limittäin meneville eventeille', assert => {
        testStacking('day', assert);
    });
    function testRendering(viewName, assert) {
        const rendered = renderingTestUtils.renderCalendarLayout(viewName, [
            {
                // Vain 1. rivi (tunnin pituinen)
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                id: 1
            },
            // Ei rivejä välissä
            {
                // Rivit 1 & 2 (2 tuntiä pitkä)
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0, 0, 0),
                id: 2
            },
            // Välissä yksi tyhjä rivi
            {
                // Rivit 4 & 5 & 6 (3 tuntia pitkä)
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0, 0),
                id: 3
            }
        ], d);
        const done = assert.async();
        contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = renderingTestUtils.getRenderedEvents(rendered);
            // 1. event pitäisi renderöityä rivin pituiseksi
            // -----------------------------------------------------------------
            const firstEvent = renderedEvents[0];
            assert.equal(firstEvent.style.height, '',
                'Tasan tunnin pituinen event ei pitäisi sisältää custom style.height-arvoa'
            );
            // 2. event pitäisi renderöityä kahden rivin pituiseksi
            // -----------------------------------------------------------------
            const secondEvent = renderedEvents[1];
            assert.equal(secondEvent.style.height, renderingTestUtils.getExpectedEventStyle(200), 'Pitäisi olla 2 riviä korkea');
            // 3. event pitäisi renderöityä kolmen rivin pituiseksi
            // -----------------------------------------------------------------
            const thirdEvent = renderedEvents[2];
            assert.equal(thirdEvent.style.height, renderingTestUtils.getExpectedEventStyle(300), 'Pitäisi olla 3 riviä korkea');
            // Assertoi stackIndeksit
            assert.equal(
                renderingTestUtils.getAllStackIndexes(renderedEvents).join(''),
                'stack-index-0'.repeat(renderedEvents.length),
                'Kaikkien eventien kaikkien osien stackIndex pitäisi olla 0'
            );
            done();
        });
    }
    function testMinuteAdjustments(viewName, assert) {
        const rendered = renderingTestUtils.renderCalendarLayout(viewName, [
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 15, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 30, 0, 0),
                id: 1
            }, {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 2, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 32, 0, 0),
                id: 2
            }, {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 40, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0, 0),
                id: 3
            }
        ], d);
        const done = assert.async();
        contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = renderingTestUtils.getRenderedEvents(rendered);
            // -----------------------------------------------------------------
            const firstEvent = renderedEvents[0];
            assert.ok(firstEvent.classList.contains('start-minutes-15'));
            assert.equal(firstEvent.style.height, renderingTestUtils.getExpectedEventStyle(125), 'Pitäisi lisätä style.height-arvoon minuutit');
            // -----------------------------------------------------------------
            const secondEvent = renderedEvents[1];
            assert.equal(secondEvent.className.indexOf('start-minutes'), -1);
            assert.equal(secondEvent.style.height, renderingTestUtils.getExpectedEventStyle(250),
                'Pitäisi lisätä style.height-arvoon minuutit pyöristettynä lähimpään 15min'
            );
            // -----------------------------------------------------------------
            const thirdEvent = renderedEvents[2];
            assert.ok(thirdEvent.classList.contains('start-minutes-45'));
            assert.equal(thirdEvent.style.height, renderingTestUtils.getExpectedEventStyle(125));
            done();
        });
    }
    function testStacking(viewName, assert) {
        const rendered = renderingTestUtils.renderCalendarLayout(viewName, [
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                id: 1
            },
            // Samassa solussa toinen eventi
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 30, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0, 0),
                id: 2
            },
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 2, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 0, 0, 0),
                id: 3
            },
            // Uusi event ennen kuin ylempi loppuu..
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 6, 0, 0, 0),
                id: 4
            },
            // Uusi event ennen kuin ylempi loppuu..
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0, 0),
                id: 5
            }
        ], d);
        const done = assert.async();
        contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = renderingTestUtils.getRenderedEvents(rendered);
            assert.equal(renderedEvents[0].className.match(/stack-index-[0-9]/)[0], 'stack-index-0');
            assert.equal(renderedEvents[1].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.equal(renderedEvents[2].className.match(/stack-index-[0-9]/)[0], 'stack-index-0');
            assert.equal(renderedEvents[3].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.equal(renderedEvents[4].className.match(/stack-index-[0-9]/)[0], 'stack-index-2');
            done();
        });
    }
});
