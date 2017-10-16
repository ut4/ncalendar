import CalendarLayout from '../../src/CalendarLayout.js';
import Content from '../../src/Content.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';

const now = new Date();
const rtu = ReactTestUtils;

QUnit.module('event/Selectors', function(hooks) {
    let testEvents;
    let repository;
    hooks.beforeEach(() => {
        testEvents = [
            {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 1), title: 'Event 1', category: 'cat1'},
            {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 1), title: 'Event 2', category: 'cat2'},
            {start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 1), title: 'Event 3', category: 'cat2'}
        ].map(event => {
            event.end = new Date(event.start);
            event.end.setHours(event.end.getHours() + 1);
            return event;
        });
        repository = new InMemoryEventRepository(testEvents);
        this.contentLoadCallSpy = sinon.spy(Content.prototype, 'loadAsyncContent');
        this.rendered = rtu.renderIntoDocument(
            $el(CalendarLayout, {
                extensions: ['event'],
                eventRepository: repository,
                toolbarParts: 'prev,next,today|title|event-categories,month,week,day'
            })
        );
    });
    hooks.afterEach(() => {
        this.contentLoadCallSpy.restore();
    });
    QUnit.test('dropdownSelector-toolbar-itemin valinta renderöi vain valitun kategorian tapahtumat', assert => {
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            // Valitse 2. kategoria (cat2)
            const dropdown = rtu.findRenderedDOMComponentWithTag(this.rendered, 'select');
            dropdown.value = testEvents[1].category;
            rtu.Simulate.change(dropdown);
            const eventsAfter = getRenderedEvents(this.rendered);
            assert.equal(eventsAfter.length, 2, 'Pitäisi renderöidä vain 2 eventiä');
            assert.equal(eventsAfter[0].textContent, testEvents[1].title,
                'Pitäisi olla kategorian "cat2" 1. event'
            );
            assert.equal(eventsAfter[1].textContent, testEvents[2].title,
                'Pitäisi olla kategorian "cat2" 2. event'
            );
            // Valitse 1. kategoria (cat1)
            dropdown.value = testEvents[0].category;
            rtu.Simulate.change(dropdown);
            const eventsAfter2 = getRenderedEvents(this.rendered);
            assert.equal(eventsAfter2.length, 1, 'Pitäisi renderöidä vain 1 event');
            assert.equal(eventsAfter2[0].textContent, testEvents[0].title,
                'Pitäisi olla kategorian "cat1" 1. event'
            );
            done();
        });
    });
});
function getRenderedEvents(rendered) {
    return rtu.scryRenderedDOMComponentsWithClass(rendered, 'event');
}
