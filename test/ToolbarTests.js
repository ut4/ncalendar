import CalendarLayout from '../src/CalendarLayout.js';
import { partGeneratorManager } from '../src/Toolbar.js';

let partCalController;
partGeneratorManager.add('abutton', function() {
    partCalController = this.ctrl;
    return $el('button', null, 'Foo');
});

QUnit.module('Toolbar', function () {
    const render = () => ReactTestUtils.renderIntoDocument($el(CalendarLayout, {
        toolbarParts: 'week|fill|day,abutton'
    }));
    QUnit.test('Renderöi asetuksien toolbarParts:iin määritellyt osat', assert => {
        const rendered = render();
        const toolbar = ReactTestUtils.findRenderedDOMComponentWithClass(rendered, 'toolbar');
        //                         .row       .col
        const columns = toolbar.children[0].children;
        assert.equal(columns.length, 3, 'Pitäisi renderöidä kolme saraketta');
        assert.equal(columns[0].querySelector('button').textContent, 'Viikko');
        assert.equal(columns[1].textContent, '');
        const lastColumnButtons = columns[2].querySelectorAll('button');
        assert.equal(lastColumnButtons[0].textContent, 'Päivä');
        assert.equal(lastColumnButtons[1].textContent, 'Foo');
        const cal = ReactTestUtils.findRenderedComponentWithType(rendered, CalendarLayout);
        assert.deepEqual(partCalController, cal.controller);
    });
});
