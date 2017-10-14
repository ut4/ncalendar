import CalendarLayout from '../src/CalendarLayout.js';
import Content, {LoadType, Cell} from '../src/Content.js';
import ExtensionFactory from '../src/ExtensionFactory.js';
import Constants from '../src/Constants.js';
import {domUtils} from './resources/Utils.js';
import TestExtension from './resources/TestExtension.js';

new ExtensionFactory().add('atest', TestExtension);

QUnit.module('CalendarLayoutComponent(with-extension)', function (hooks) {
    hooks.beforeEach(() => {
        this.contentLoadCallSpy = sinon.spy(Content.prototype, 'loadAsyncContent');
        this.contentApplyCallSpy = sinon.spy(Content.prototype, 'applyAsyncContent');
        this.extensionLoadCallSpy = sinon.spy(TestExtension.prototype, 'load');
        this.clickHandlerSpy = sinon.spy(TestExtension, 'testClickHandler');
    });
    hooks.afterEach(() => {
        this.contentLoadCallSpy.restore();
        this.contentApplyCallSpy.restore();
        this.extensionLoadCallSpy.restore();
        TestExtension.testClickHandler.restore();
    });
    const render = (mySettings) => {
        const settings = {defaultView: Constants.VIEW_WEEK, extensions: ['atest']};
        mySettings && Object.assign(settings, mySettings);
        return ReactTestUtils.renderIntoDocument($el(CalendarLayout, settings));
    };
    QUnit.test('Instantioi & lataa & ajaa laajennoksen', assert => {
        const rendered = render();
        const expectedTestExtension = getInstantiatedExtensions(rendered)[0];
        assert.ok(
            expectedTestExtension instanceof TestExtension,
            'Pitäisi instantioida laajennos'
        );
        assert.ok(
            isProbablyCalendarController(expectedTestExtension.args[0]),
            '2. laajennoksen konstruktoriin passattu argumentti pitäisi olla calendarController-instanssi'
        );
        assert.deepEqual(
            getInstantiatedCalendar(rendered).getController().getExtension('atest'),
            expectedTestExtension,
            'calendarController.getExtension pitäisi palauttaa instantoitu laajennos'
        );
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedRows = getRenderedRows(rendered);
            assert.ok(this.extensionLoadCallSpy.calledOnce, 'Pitäisi ladata laajennos');
            assert.deepEqual(this.extensionLoadCallSpy.firstCall.args, [LoadType.INITIAL],
                'Pitäisi passata laajennoksen loadTypeksi LoadType.INITIAL'
            );
            assert.ok(this.contentApplyCallSpy.calledOnce, 'Pitäisi ajaa ladattu sisältö');
            assert.equal(renderedRows.length, Constants.HOURS_IN_DAY);
            assert.ok(
                isEveryCellDecoratedWith(rendered, expectedTestExtension.loadCount),
                'Jokainen solu pitäisi olla dekoroitu'
            );
            done();
        });
    });
    QUnit.test('Skippaa renderöinnin, jos extensionin .load palautti false', assert => {
        render({extensions: ['atest'], testExtensionLoadReturnValue: false});
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            assert.ok(this.contentApplyCallSpy.notCalled, 'Ei pitäisi ajaa sisältöä');
            done();
        });
    });
    QUnit.test('contentController.refresh ajaa laajennoksen uudestaan', assert => {
        const rendered = render();
        const expectedTestExtension = getInstantiatedExtensions(rendered)[0];
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const decoratingSpy = sinon.spy(expectedTestExtension, 'decorateCell');
            this.contentLoadCallSpy.reset();
            // Päivitä dekoroitava luku, ja triggeröi contentController.refresh
            const newDecorating = 45;
            expectedTestExtension.setLoadCount(newDecorating);
            expectedTestExtension.getContentController().refresh();
            assert.ok(
                decoratingSpy.callCount,
                Constants.DAYS_IN_WEEK * Constants.HOURS_IN_DAY,
                'Pitäisi ajaa extensionin dekorointi uudelleen'
            );
            assert.ok(
                isEveryCellDecoratedWith(rendered, newDecorating),
                'Jokainen solu pitäisi olla uudelleendekoroitu'
            );
            assert.ok(
                this.contentLoadCallSpy.notCalled,
                'Ei pitäisi uudelleenladata sisältöä'
            );
            done();
        });
    });
    QUnit.test('contentController.reRender renderöi sisällön uudestaan', assert => {
        const rendered = render();
        const expectedTestExtension = getInstantiatedExtensions(rendered)[0];
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const decoratingSpy = sinon.spy(expectedTestExtension, 'decorateCell');
            // Päivitä ensimmäisen solun sisältö & kutsu reRender
            const updatedFirstCellContent = 'klyu';
            expectedTestExtension.getFirstCell().content = updatedFirstCellContent;
            expectedTestExtension.getContentController().reRender();
            // Assertoi, että renderöi päivitetyn sisällön
            assert.ok(
                getRenderedRows(rendered)[0].textContent.indexOf(updatedFirstCellContent) > -1,
                updatedFirstCellContent,
                'Pitäisi renderöidä päivitetty sisältö'
            );
            assert.ok(decoratingSpy.notCalled, 'Ei pitäisi dekoroida uudelleen');
            done();
        });
    });
    QUnit.test('Kutsuu rekisteröityjä clickHandlereita', assert => {
        const rendered = render();
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const firstHourRow = getRenderedRows(rendered)[0];
            //                 .row       .col         .cell
            const mondayCell = firstHourRow.children[1].children[0];
            const tuesDayCell = firstHourRow.children[2].children[0];
            ReactTestUtils.Simulate.click(mondayCell); // pitäisi olla klikattava
            ReactTestUtils.Simulate.click(tuesDayCell); // ei pitäisi olla klikattava
            assert.ok(
                this.clickHandlerSpy.calledOnce,
                'Pitäisi kutsua testiextensionin lisäämää click-handleria'
            );
            assert.deepEqual(this.clickHandlerSpy.firstCall.args.length, 2);
            assert.ok(
                this.clickHandlerSpy.firstCall.args[0] instanceof Cell,
                'Handlerin 1. argumentti pitäisi olla Cell-instanssi'
            );
            assert.equal(
                typeof this.clickHandlerSpy.firstCall.args[1].preventDefault,
                'function',
                'Handlerin 2. argumentti pitäisi olla click-event'
            );
            done();
        });
    });
    QUnit.test('Ei lataa laajennoksia jos niitä ei ole valittu', assert => {
        const rendered = render({extensions: []});
        assert.equal(getInstantiatedExtensions(rendered).length, 0,
            'Ei pitäisi instantioida laajennoksia'
        );
        // Triggöi navigaatiotapahtuma
        ReactTestUtils.Simulate.click(domUtils.findButtonByContent(rendered, '<'));
        //
        assert.ok(
            this.contentLoadCallSpy.notCalled,
            'Ei pitäisi ladata, tai uudelleenpäivittää laajennoksia'
        );
    });
    QUnit.test('Toolbarin next-sivutuspainike triggeröi laajennoksen päivityksen', assert => {
        testButtonClickTriggersDecoratorRefresh.call(this, '>', assert, LoadType.NAVIGATION);
    });
    QUnit.test('Toolbarin prev-sivutuspainike triggeröi laajennoksen päivityksen', assert => {
        testButtonClickTriggersDecoratorRefresh.call(this, '<', assert, LoadType.NAVIGATION);
    });
    QUnit.test('Toolbarin näkymänvaihtopainike triggeröi laajennoksen päivityksen', assert => {
        testButtonClickTriggersDecoratorRefresh.call(this, 'Kuukausi', assert, LoadType.VIEW_CHANGE);
    });
    QUnit.test('Renderöi laajennoksen lisäämän toobarPartin', assert => {
        const rendered = render({toolbarParts: 'week|fill|day,abutton'});
        const toolbar = ReactTestUtils.findRenderedDOMComponentWithClass(rendered, 'toolbar');
        //                         .row       .col
        const columns = toolbar.children[0].children;
        assert.equal(columns.length, 3, 'Pitäisi renderöidä kolme saraketta');
        assert.equal(columns[0].querySelector('button').textContent, 'Viikko');
        assert.equal(columns[1].textContent, '');
        const lastColumnButtons = columns[2].querySelectorAll('button');
        assert.equal(lastColumnButtons[0].textContent, 'Päivä');
        const expectedToolbarButtonText = getInstantiatedExtensions(rendered)[0].getToolbarButtonText();
        assert.equal(lastColumnButtons[1].textContent, expectedToolbarButtonText);
    });
    function testButtonClickTriggersDecoratorRefresh(buttonContent, assert, expectedLoadType) {
        let contentBefore;
        const rendered = render();
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            contentBefore = domUtils.getElementContent(rendered, '.main');
            this.contentLoadCallSpy.reset(); // pyyhi initial load
            this.extensionLoadCallSpy.reset();
            // Triggöi navigaatiotapahtuma
            ReactTestUtils.Simulate.click(domUtils.findButtonByContent(rendered, buttonContent));
            //
            assert.ok(this.contentLoadCallSpy.calledOnce, 'Pitäisi ladata laajennokset uudelleen');
            return this.contentLoadCallSpy.firstCall.returnValue;
        }).then(() => {
            assert.ok(this.extensionLoadCallSpy.calledOnce, 'Pitäisi triggeröidä laajennoksen load uudelleen');
            assert.deepEqual(this.extensionLoadCallSpy.firstCall.args, [expectedLoadType],
                'Pitäisi passata laajennoksen LoadType:ksi ' + expectedLoadType
            );
            const contentAfter = domUtils.getElementContent(rendered, '.main');
            assert.notEqual(contentAfter, contentBefore);
            done();
        });
    }
    function isEveryCellDecoratedWith(rendered, what) {
        const combinedCellContents = what.toString().repeat(Constants.DAYS_IN_WEEK);
        return getRenderedRows(rendered).every(row =>
            row.textContent.indexOf(combinedCellContents) > -1
        );
    }
    function getRenderedRows(rendered) {
        return Array.prototype.slice.call(ReactTestUtils.scryRenderedDOMComponentsWithClass(
            rendered, 'row'
        )).slice(2);// toolbarin, ja headerin rivit pois
    }
    function getInstantiatedCalendar(rendered) {
        return ReactTestUtils.findRenderedComponentWithType(rendered, CalendarLayout);
    }
    function getInstantiatedExtensions(rendered) {
        return getInstantiatedCalendar(rendered).extensions || [];
    }
    function isProbablyCalendarController(object) {
        return object instanceof Object && object.hasOwnProperty('changeView');
    }
});
