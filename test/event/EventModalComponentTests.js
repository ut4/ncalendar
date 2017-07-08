define(['src/event/EventModal', 'test/resources/Utils'], (EventModal, Utils) => {
    'use strict';
    const rtu = ReactTestUtils;
    QUnit.module('event/EventModalComponent', () => {
        QUnit.test('Asettaa props.eventin arvot inputeihin', assert => {
            const now = new Date();
            const testEvent = {title: 'gr', date: now};
            const rendered = rtu.renderIntoDocument($el(EventModal.default, {
                event: testEvent
            }));
            const [titleInput, dateInput] = rtu.scryRenderedDOMComponentsWithTag(rendered, 'input');
            assert.equal(titleInput.value, testEvent.title,
                'Pitäisi asettaa props.event.title:n arvo title-inputiin'
            );
            assert.equal(dateInput.value, testEvent.date.toISOString(),
                'Pitäisi asettaa props.event.date:n arvo date-inputiin'
            );
        });
        QUnit.test('Submit passaa confirm-callbackille lomakkeen datan', assert => {
            const now = new Date();
            const confirmCallbackSpy = sinon.spy();
            const modalCloseSpy = sinon.spy();
            // Renderöi modal
            const rendered = rtu.renderIntoDocument($el(EventModal.default, {
                confirm: confirmCallbackSpy,
                closeModal: modalCloseSpy,
                event: {title: '', date: now}
            }));
            // Täytä inputeihin jotain
            const [titleInput, dateInput] = rtu.scryRenderedDOMComponentsWithTag(rendered, 'input');
            titleInput.value = 'asdf';
            rtu.Simulate[React.INPUT_EVENT](titleInput);
            now.setDate(now.getDate() + 3);
            dateInput.value = now.toISOString();
            rtu.Simulate[React.INPUT_EVENT](dateInput);
            // Triggeröi submit
            const submitButton = rtu.scryRenderedDOMComponentsWithTag(rendered, 'button')[0];
            rtu.Simulate.click(submitButton);
            // Assertoi että kutsui confirm-callbackia
            assert.ok(confirmCallbackSpy.calledOnce, 'Pitäisi kutsua confirm-callbackia');
            assert.deepEqual(confirmCallbackSpy.firstCall.args, [{
                title: titleInput.value,
                date: dateInput.value
            }], 'Pitäisi passata confirm-callbackille lomakkeen arvot');
            assert.ok(modalCloseSpy.calledOnce, 'Pitäisi lopuksi kutsua props.closeModal');
        });
    });
});
