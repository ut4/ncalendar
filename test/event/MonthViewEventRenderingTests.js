import Content from '../../src/Content.js';
import renderingTestUtils from './renderingTestUtils.js';

const d = new Date(2017, 7, 1);

QUnit.module('event/MonthViewEventRendering', function (hooks) {
    let contentLoadCallSpy;
    hooks.beforeEach(() => {
        contentLoadCallSpy = sinon.spy(Content.prototype, 'loadAsyncContent');
    });
    hooks.afterEach(() => {
        contentLoadCallSpy.restore();
    });
    QUnit.test('Kuukausinäkymä renderöi eventit oikean pituisina, sekä asettaa ' +
        'stackIndex-0 -luokan, jos eventit ei mene limittäin', assert => {
        const rendered = renderingTestUtils.renderCalendarLayout('month', [
            {
                // Vain 1 solu
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 0, 0, 0, 0),
                id: 1
            }, {
                // 2 solua, heti seuraava päivä
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate()+3, 0, 0, 0, 0),
                id: 2
            }, {
                // 3 solua, seuraava viikko
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate()+6, 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate()+8, 22, 30, 0, 0),
                id: 3
            }
        ], d);
        const done = assert.async();
        contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = renderingTestUtils.getRenderedEvents(rendered);
            // 1. event pitäisi renderöityä vain yhteen soluun
            // -----------------------------------------------------------------
            const firstEvent = renderedEvents[0];
            assert.equal(firstEvent.style.width, '', 'Ei pitäisi asettaa custom style.width:iä');
            // 2. event pitäisi renderöityä kahden solun pituiseksi
            // -----------------------------------------------------------------
            const secondEvent = renderedEvents[1];
            assert.equal(secondEvent.style.width, renderingTestUtils.getExpectedEventStyle(200),
                'Event pitäisi olla 2 solua pitkä'
            );
            // 3. event pitäisi renderöityä kolmen solun pituiseksi
            // -----------------------------------------------------------------
            const thirdEvent = renderedEvents[2];
            assert.equal(thirdEvent.style.width, renderingTestUtils.getExpectedEventStyle(300),
                'Event pitäisi olla 3 solua pitkä'
            );
            // Assertoi stackIndeksit
            assert.equal(
                renderingTestUtils.getAllStackIndexes(renderedEvents).join(''),
                'stack-index-0'.repeat(renderedEvents.length),
                'Kaikkien eventien kaikkien osien stackIndex pitäisi olla 0'
            );
            done();
        });
    });
    QUnit.test('Kuukausinäkymä asettaa >0 stackIndeksit limittäin meneville eventeille', assert => {
        const rendered = renderingTestUtils.renderCalendarLayout('month', [
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 0, 0, 0, 0),
                id: 1
            },
            // Samassa solussa toinen eventi
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate()+2, 0, 0, 0, 0),
                id: 2
            },
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate()+2, 0, 0, 0, 0),
                id: 3
            },
            {
                start: new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 0, 0, 0, 0),
                end: new Date(d.getFullYear(), d.getMonth(), d.getDate()+5, 22, 30, 0, 0),
                id: 4
            }
        ], d);
        const done = assert.async();
        contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = renderingTestUtils.getRenderedEvents(rendered);
            assert.equal(renderedEvents[0].className.match(/stack-index-[0-9]/)[0], 'stack-index-0');
            assert.equal(renderedEvents[1].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.equal(renderedEvents[2].className.match(/stack-index-[0-9]/)[0], 'stack-index-1');
            assert.equal(renderedEvents[3].className.match(/stack-index-[0-9]/)[0], 'stack-index-2');
            done();
        });
    });
    QUnit.test('Kuukausinäkymä katkaisee seuraavalle viikolle menevät osuudet', assert => {
        const rendered = renderingTestUtils.renderCalendarLayout('month', [
            {
                start: new Date(d.getFullYear(), d.getMonth(), 5, 0, 0, 0, 0), // Lauantai
                end: new Date(d.getFullYear(), d.getMonth(), 7, 22, 0, 0, 0), // Seuraava maanantai
                id: 1
            },
            {
                start: new Date(d.getFullYear(), d.getMonth(), 10, 0, 0, 0, 0), // Torstai
                end: new Date(d.getFullYear(), d.getMonth(), 16, 5, 30, 0, 0), // Seuraava keskiviikko
                id: 2
            },
            {
                start: new Date(d.getFullYear(), d.getMonth(), 16, 0, 0, 0, 0), // Keskiviikko
                end: new Date(d.getFullYear(), d.getMonth(), 29, 12, 0, 0, 0), // Tiistai 2vko eteenpäin
                id: 3
            }
        ], d);
        const done = assert.async();
        contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = renderingTestUtils.getRenderedEvents(rendered);
            assert.equal(renderedEvents.length, 7, 'Pitäisi katkaista eventit osiin (2 + 2 + 3 = 7)');
            assert.equal(renderedEvents[0].style.width, renderingTestUtils.getExpectedEventStyle(200),// La-Su
                '1. eventin 1. osa pitäisi olla 2 solua pitkä'
            );
            assert.equal(renderedEvents[1].style.width, '', // Ma
                '1. eventin 2. osa pitäisi olla 1 solua pitkä'
            );
            assert.equal(renderedEvents[2].style.width, renderingTestUtils.getExpectedEventStyle(400),// To-Su
                '2. eventin 1. osa pitäisi olla 4 solua pitkä'
            );
            assert.equal(renderedEvents[3].style.width, renderingTestUtils.getExpectedEventStyle(225),// Ma-Ke
                '2. eventin 2. osa pitäisi olla 2.25 solua pitkä'
            );
            assert.equal(renderedEvents[4].style.width, renderingTestUtils.getExpectedEventStyle(500),// Ke-Su
                '3. eventin 1. osa pitäisi olla 5 solua pitkä'
            );
            assert.equal(renderedEvents[5].style.width, renderingTestUtils.getExpectedEventStyle(700),// Ke-Su
                '3. eventin 2. osa pitäisi olla koko rivin pituinen'
            );
            assert.equal(renderedEvents[6].style.width, renderingTestUtils.getExpectedEventStyle(150),// Ma-Ti
                '3. eventin 3. osa pitäisi olla 1.5 solua pitkä'
            );
            assert.equal(renderedEvents[4].className.match(/stack-index-[0-9]/)[0], 'stack-index-1',
                'Pitäisi ottaa spawningsit huomioon stackauksessa'
            );
            assert.equal(renderedEvents[5].className.match(/stack-index-[0-9]/)[0], 'stack-index-0',
                'Pitäisi ottaa spawningsit huomioon stackauksessa'
            );
            assert.equal(renderedEvents[6].className.match(/stack-index-[0-9]/)[0], 'stack-index-0',
                'Pitäisi ottaa spawningsit huomioon stackauksessa'
            );
            done();
        });
    });
});
