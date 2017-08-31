import Toolbar from '../src/Toolbar.js';

const rtu = ReactTestUtils;

QUnit.module('ToolbarComponent', function() {
    let fakeCalendarController;
    function renderToolbar(props) {
        fakeCalendarController = {
            dateCursor: {range: {start: new Date(), end: new Date()}}
        };
        return rtu.renderIntoDocument($el(Toolbar, Object.assign({
            calendarController: fakeCalendarController
        }, props)));
    }
    QUnit.test('Renderöi custom osiot & titlen', assert => {
        const someTitle = 'foo';
        const formatterStub = sinon.stub().returns(someTitle);
        const props = {parts: 'title|week|fill,fill', titleFormatter: formatterStub, dateUtils: 'fr'};
        const rendered = renderToolbar(props);
        const groups = getRenderedToolbarParts(rendered);
        //
        assert.ok(groups.length, 3, 'Pitäisi renderöidä kolme saraketta');
        assert.equal(groups[0].textContent, someTitle, 'Pitäsi renderöidä custom title');
        assert.equal(groups[1].children.length, 1, 'Pitäsi renderöidä custom-määrä painikkeita');
        assert.equal(groups[1].children[0].nodeName, 'BUTTON');
        assert.equal(groups[1].textContent, 'Viikko');
        assert.equal(groups[2].textContent, '');
        assert.deepEqual(formatterStub.firstCall.args, [
            fakeCalendarController.dateCursor.range,
            props.dateUtils
        ], 'Pitäisi passata formatterille nämä');
    });
    function getRenderedToolbarParts(rendered) {
        return rtu.findRenderedDOMComponentWithClass(rendered, 'toolbar').querySelectorAll('.col');
    }
});
