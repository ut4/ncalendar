import Event from '../../src/event/Event.js';
import EventModal from '../../src/event/EventModal.js';

const rtu = ReactTestUtils;

QUnit.module('event/EventModalComponent', function() {
    QUnit.test('Asettaa props.eventin arvot inputeihin', assert => {
        const testEvent = new Event({start: new Date()});
        const rendered = rtu.renderIntoDocument($el(EventModal, {
            event: testEvent
        }));
        const [titleInput, startInput, endInput] = rtu.scryRenderedDOMComponentsWithTag(rendered, 'input');
        assert.equal(titleInput.value, testEvent.title,
            'Pitäisi asettaa props.event.title:n arvo title-inputiin'
        );
        assert.equal(startInput.value, testEvent.start.toISOString(),
            'Pitäisi asettaa props.event.start:n arvo start-inputiin'
        );
        assert.equal(endInput.value, testEvent.end.toISOString(),
            'Pitäisi asettaa props.event.end:n arvo end-inputiin'
        );
    });
    QUnit.test('Submit passaa onConfirm-callbackille lomakkeen datan', assert => {
        const now = new Date();
        const event = new Event({start: now});
        const confirmCallbackSpy = sinon.spy();
        const modalCloseSpy = sinon.spy();
        // Renderöi modal
        const rendered = rtu.renderIntoDocument($el(EventModal, {
            onConfirm: confirmCallbackSpy,
            closeModal: modalCloseSpy,
            event
        }));
        // Täytä inputeihin jotain
        const [titleInput, startInput, endInput] = rtu.scryRenderedDOMComponentsWithTag(rendered, 'input');
        titleInput.value = 'asdf';
        rtu.Simulate[React.INPUT_EVENT](titleInput);
        now.setDate(now.getDate() + 2);
        startInput.value = now.toISOString();
        rtu.Simulate[React.INPUT_EVENT](startInput);
        now.setDate(now.getDate() + 2);
        endInput.value = now.toISOString();
        rtu.Simulate[React.INPUT_EVENT](endInput);
        // Triggeröi submit
        const submitButton = rtu.scryRenderedDOMComponentsWithTag(rendered, 'button')[0];
        rtu.Simulate.click(submitButton);
        // Assertoi että kutsui confirm-callbackia
        assert.ok(confirmCallbackSpy.calledOnce, 'Pitäisi kutsua confirm-callbackia');
        assert.deepEqual(confirmCallbackSpy.firstCall.args, [new Event(Object.assign({
            title: titleInput.value,
            start: startInput.value,
            end: endInput.value
        }, event))], 'Pitäisi passata confirm-callbackille lomakkeen arvot');
        assert.ok(modalCloseSpy.calledOnce, 'Pitäisi lopuksi kutsua props.closeModal');
    });
});
