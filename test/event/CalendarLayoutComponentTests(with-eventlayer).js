import {domUtils} from '../resources/Utils.js';
import CalendarLayout from '../../src/CalendarLayout.js';
import Content from '../../src/Content.js';
import Event from '../../src/event/Event.js';
import EventLayer from '../../src/event/EventLayer.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';
import ContentLayerFactory from '../../src/ContentLayerFactory.js';

const now = new Date();
const rtu = ReactTestUtils;
new ContentLayerFactory().register('eventasd', EventLayer);

QUnit.module('event/CalendarLayoutComponent(with-eventlayer)', function(hooks) {
    let testEvents;
    let repository;
    hooks.beforeEach(() => {
        testEvents = [
            {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 1), title: 'Event 1'},
            {start: new Date(now.getFullYear(), now.getMonth(), now.getDate()-7, 0, 0, 0, 1), title: 'Event 2'},
            {start: new Date(now.getFullYear(), now.getMonth()-1, now.getDate(), 0, 0, 0, 1), title: 'Event 3'}
        ].map(event => {
            event.end = new Date(event.start);
            event.end.setHours(event.end.getHours() + 1);
            return event;
        });
        repository = new InMemoryEventRepository(testEvents);
        this.contentLoadCallSpy = sinon.spy(Content.prototype, 'loadAsyncContent');
        this.rendered = rtu.renderIntoDocument(
            $el(CalendarLayout, {
                contentLayers: [{name: 'eventasd', args: (contentCtrl, calCtrl) =>
                    [repository, contentCtrl, calCtrl]
                }]
            })
        );
    });
    hooks.afterEach(() => {
        this.contentLoadCallSpy.restore();
    });
    QUnit.test('renderöi load:issa haetut eventit kalenteriin', assert => {
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const events = getRenderedEvents(this.rendered);
            assert.equal(events.length, 1);
            assert.ok(
                new RegExp(testEvents[0]).test(events[0].textContent),
                'Pitäisi renderöidä oikea tapahtuma'
            );
            done();
        });
    });
    QUnit.test('solua klikkaamalla voi luoda uuden tapahtuman', assert => {
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const hourRows = getRenderedRows(this.rendered);
            const renderedEventCountBefore = getRenderedEvents(this.rendered).length;
            const repositoryInsertSpy = sinon.spy(repository, 'insert');
            // Triggeröi klikkaus
            const mondayAt0Am = hourRows[0].children[1].children[0];
            rtu.Simulate.click(mondayAt0Am);
            const inputs = getRenderedInputs(this.rendered);
            assert.equal(inputs.length, 3, 'Pitäisi avata modal');
            const data = {title: 'Foo', start: getTestDateString(testEvents), end: getTestDateString(testEvents, 3)};
            // Triggeröi lomakkeen submit
            inputs[0].value = data.title; rtu.Simulate[React.INPUT_EVENT](inputs[0]);
            inputs[1].value = data.start; rtu.Simulate[React.INPUT_EVENT](inputs[1]);
            inputs[2].value = data.end; rtu.Simulate[React.INPUT_EVENT](inputs[2]);
            rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Ok'));
            // Assertoi että luo tapahtuman ja renderöi sen kalenteriin
            assert.equal(getRenderedInputs(this.rendered).length, 0, 'Pitäisi sulkea modal');
            assert.ok(repositoryInsertSpy.calledOnce, 'Pitäisi kutsua repository.insert');
            assert.deepEqual(
                Object.assign(repositoryInsertSpy.firstCall.args[0], {id: 1}),
                Object.assign(new Event(data), {id: 1}),
                'Pitäisi passata event-data repository.insert:lle'
            );
            repositoryInsertSpy.firstCall.returnValue.then(() => {
                const renderedEventsAfter = getRenderedEvents(this.rendered);
                assert.equal(renderedEventsAfter.length, renderedEventCountBefore + 1,
                    'Pitäisi lisätä luotu tapahtuma kalenteriin'
                );
                assert.ok(
                    hourRows[2].contains(renderedEventsAfter[1]),
                    'Pitäisi renderöidä uusi tapahtuma oikealle tuntiriville'
                );
                done();
            });
        });
    });
    QUnit.test('renderöidyn tapahtuman edit-nappia klikkaamalla voi muokata tapahtumaa', assert => {
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const hourRows = getRenderedRows(this.rendered);
            const renderedEvents = getRenderedEvents(this.rendered);
            const renderedEventCountBefore = renderedEvents.length;
            const renderedEventContentBefore = renderedEvents[0].textContent;
            const renderedEventParenBefore = renderedEvents[0].parentNode;
            const repositoryUpdateSpy = sinon.spy(repository, 'update');
            // Triggeröi klikkaus
            const eventEditButton = renderedEvents[0].querySelector('button[title="Muokkaa"]');
            rtu.Simulate.click(eventEditButton);
            const inputs = getRenderedInputs(this.rendered);
            assert.equal(inputs.length, 3, 'Pitäisi avata modal');
            // Simuloi lomakkeen submit
            const data = {title: 'Holyy', start: getTestDateString(testEvents), end: getTestDateString(testEvents, 3)};
            inputs[0].value = data.title; rtu.Simulate[React.INPUT_EVENT](inputs[0]);
            inputs[1].value = data.start; rtu.Simulate[React.INPUT_EVENT](inputs[1]);
            inputs[2].value = data.end; rtu.Simulate[React.INPUT_EVENT](inputs[2]);
            rtu.Simulate.click(domUtils.findButtonByContent(this.rendered, 'Ok'));
            // Assertoi että päivitti tapahtuman ja uudelleenrenderöi kalenterin oikein
            assert.equal(getRenderedInputs(this.rendered).length, 0, 'Pitäisi sulkea modal');
            assert.ok(repositoryUpdateSpy.calledOnce, 'Pitäisi kutsua repository.update');
            assert.deepEqual(repositoryUpdateSpy.firstCall.args,
                [new Event(Object.assign(data, {id: repository.events[0].id}))],
                'Pitäisi passata repository.update:lle päivitetty event'
            );
            repositoryUpdateSpy.firstCall.returnValue.then(() => {
                const renderedEventsAfter = getRenderedEvents(this.rendered);
                assert.equal(renderedEventsAfter.length, renderedEventCountBefore,
                    'Ei pitäisi lisätä eikä poistaa tapahtumia kalenterista'
                );
                assert.notEqual(
                    renderedEventsAfter[0].textContent,
                    renderedEventContentBefore,
                    'Pitäisi päivittää eventin sisällön'
                );
                assert.notDeepEqual(
                    renderedEventsAfter[0].parentNode,
                    renderedEventParenBefore,
                    'Pitäisi siirtää tapahtuma uuteen soluun'
                );
                assert.ok(
                    hourRows[2].contains(renderedEventsAfter[0]),
                    'Pitäisi siirtää tapahtuma oikeaan soluun'
                );
                done();
            });
        });
    });
    QUnit.test('renderöidyn tapahtuman delete-nappia klikkaamalla voi poistaa tapahtuman', assert => {
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedEvents = getRenderedEvents(this.rendered);
            const renderedEventCountBefore = renderedEvents.length;
            const expectedDeleteData = new Event(repository.events[0]);
            const repositoryDeleteSpy = sinon.spy(repository, 'delete');
            // Triggeröi klikkaus
            const deleteEditButton = renderedEvents[0].querySelector('button[title="Poista"]');
            rtu.Simulate.click(deleteEditButton);
            // Assertoi että poistaa tapahtuman ja uudelleenrenderöi kalenterin
            assert.ok(repositoryDeleteSpy.calledOnce, 'Pitäisi kutsua repository.delete');
            assert.deepEqual(
                repositoryDeleteSpy.firstCall.args,
                [expectedDeleteData],
                'Pitäisi passata repository.delete:lle oikea tapahtuma'
            );
            repositoryDeleteSpy.firstCall.returnValue.then(() => {
                const renderedEventsAfter = getRenderedEvents(this.rendered);
                assert.equal(renderedEventsAfter.length, renderedEventCountBefore - 1,
                    'Pitäisi poistaa tapahtuman kalenterista'
                );
                done();
            });
        });
    });
});
function getRenderedInputs(rendered) {
    return rtu.scryRenderedDOMComponentsWithTag(rendered, 'input');
}
function getRenderedEvents(rendered) {
    return rtu.scryRenderedDOMComponentsWithClass(rendered, 'event');
}
function getRenderedRows(rendered) {
    return rtu.findRenderedDOMComponentWithClass(rendered, 'main').children;
}
function getTestDateString(testEvents, hour = 2) {
    const date = new Date(testEvents[0].start);
    date.setHours(hour);
    return date.toISOString();
}
