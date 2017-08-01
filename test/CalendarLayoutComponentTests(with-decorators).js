import CalendarLayout from '../src/CalendarLayout.js';
import Content, {LoadType, Cell} from '../src/Content.js';
import ContentLayerFactory from '../src/ContentLayerFactory.js';
import Constants from '../src/Constants.js';
import {domUtils} from './resources/Utils.js';
import TestContentLayer from './resources/TestContentLayer.js';

new ContentLayerFactory().register('atest', TestContentLayer);

QUnit.module('CalendarLayoutComponent(with-decorators)', function (hooks) {
    hooks.beforeEach(() => {
        this.contentLoadCallSpy = sinon.spy(Content.prototype, 'loadAsyncContent');
        this.contentApplyCallSpy = sinon.spy(Content.prototype, 'applyAsyncContent');
        this.contentLayerLoadCallSpy = sinon.spy(TestContentLayer.prototype, 'load');
        this.clickHandlerSpy = sinon.spy(TestContentLayer, 'testClickHandler');
    });
    hooks.afterEach(() => {
        this.contentLoadCallSpy.restore();
        this.contentApplyCallSpy.restore();
        this.contentLayerLoadCallSpy.restore();
        TestContentLayer.testClickHandler.restore();
    });
    const render = (contentLayers = ['atest']) => {
        return ReactTestUtils.renderIntoDocument($el(CalendarLayout, {
            defaultView: Constants.VIEW_WEEK,
            contentLayers: contentLayers
        }));
    };
    QUnit.test('Instantioi & lataa & ajaa sisältökerroksen', assert => {
        const rendered = render();
        const expectedTestLayer = getInstantiatedLayers(rendered)[0];
        assert.ok(
            expectedTestLayer instanceof TestContentLayer,
            'Pitäisi instantioida sisältökerros'
        );
        assert.ok(
            isProbablyContentController(expectedTestLayer.args[0]),
            '1. sisältökerroksen konstruktoriin passattu argumentti pitäisi olla contentController-instanssi'
        );
        assert.ok(
            isProbablyCalendarController(expectedTestLayer.args[1]),
            '2. sisältökerroksen konstruktoriin passattu argumentti pitäisi olla calendarController-instanssi'
        );
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const renderedRows = getRenderedRows(rendered);
            assert.ok(this.contentLayerLoadCallSpy.calledOnce, 'Pitäisi ladata sisältökerros');
            assert.deepEqual(this.contentLayerLoadCallSpy.firstCall.args, [LoadType.INITIAL],
                'Pitäisi passata sisältökerroksen loadTypeksi LoadType.INITIAL'
            );
            assert.ok(this.contentApplyCallSpy.calledOnce, 'Pitäisi ajaa ladattu sisältö');
            assert.equal(renderedRows.length, Constants.HOURS_IN_DAY);
            assert.ok(
                isEveryCellDecoratedWith(rendered, expectedTestLayer.loadCount),
                'Jokainen solu pitäisi olla dekoroitu'
            );
            done();
        });
    });
    QUnit.test('Lataa myös object-notaatiolla configuroidun sisältökerroksen', assert => {
        const rendered = render([{name: 'atest'}]);// [{name: 'atest'}] eikä ['atest']
        const expectedTestLayer = getInstantiatedLayers(rendered)[0];
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            assert.ok(expectedTestLayer instanceof TestContentLayer,
                'Pitäisi osata ladata myös object-notaatiolla configuroitu layer'
            );
            done();
        });
    });
    QUnit.test('Skippaa renderöinnin, jos layerin .load palautti false', assert => {
        render([{name: 'atest', args: (a, b) => [a, b, false]}]);
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            assert.ok(this.contentApplyCallSpy.notCalled, 'Ei pitäisi ajaa sisältöä');
            done();
        });
    });
    QUnit.test('contentController.refresh ajaa sisältökerroksen uudestaan', assert => {
        const rendered = render();
        const expectedTestLayer = getInstantiatedLayers(rendered)[0];
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const decoratingSpy = sinon.spy(expectedTestLayer, 'decorateCell');
            this.contentLoadCallSpy.reset();
            // Päivitä dekoroitava luku, ja triggeröi contentController.refresh
            const newDecorating = 45;
            expectedTestLayer.setLoadCount(newDecorating);
            expectedTestLayer.getContentController().refresh();
            assert.ok(
                decoratingSpy.callCount,
                Constants.DAYS_IN_WEEK * Constants.HOURS_IN_DAY,
                'Pitäisi ajaa layerin dekorointi uudelleen'
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
        const expectedTestLayer = getInstantiatedLayers(rendered)[0];
        //
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            const decoratingSpy = sinon.spy(expectedTestLayer, 'decorateCell');
            // Päivitä ensimmäisen solun sisältö & kutsu reRender
            const updatedFirstCellContent = 'klyu';
            expectedTestLayer.getFirstCell().content = updatedFirstCellContent;
            expectedTestLayer.getContentController().reRender();
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
                'Pitäisi kutsua testilayerin lisäämää click-handleria'
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
    QUnit.test('Ei lataa sisältökerroksia jos niitä ei ole valittu', assert => {
        const rendered = render([]);
        assert.equal(getInstantiatedLayers(rendered).length, 0,
            'Ei pitäisi instantioida sisältökerroksia'
        );
        // Triggöi navigaatiotapahtuma
        ReactTestUtils.Simulate.click(domUtils.findButtonByContent(rendered, '<'));
        //
        assert.ok(
            this.contentLoadCallSpy.notCalled,
            'Ei pitäisi ladata, tai uudelleenpäivittää sisältökerroksia'
        );
    });
    QUnit.test('Toolbarin next-sivutuspainike triggeröi sisältökerroksen päivityksen', assert => {
        testButtonClickTriggersDecoratorRefresh.call(this, '>', assert, LoadType.NAVIGATION);
    });
    QUnit.test('Toolbarin prev-sivutuspainike triggeröi sisältökerroksen päivityksen', assert => {
        testButtonClickTriggersDecoratorRefresh.call(this, '<', assert, LoadType.NAVIGATION);
    });
    QUnit.test('Toolbarin näkymänvaihtopainike triggeröi sisältökerroksen päivityksen', assert => {
        testButtonClickTriggersDecoratorRefresh.call(this, 'Kuukausi', assert, LoadType.VIEW_CHANGE);
    });
    function testButtonClickTriggersDecoratorRefresh(buttonContent, assert, expectedLoadType) {
        let contentBefore;
        const rendered = render();
        const done = assert.async();
        this.contentLoadCallSpy.firstCall.returnValue.then(() => {
            contentBefore = domUtils.getElementContent(rendered, '.main');
            this.contentLoadCallSpy.reset(); // pyyhi initial load
            this.contentLayerLoadCallSpy.reset();
            // Triggöi navigaatiotapahtuma
            ReactTestUtils.Simulate.click(domUtils.findButtonByContent(rendered, buttonContent));
            //
            assert.ok(this.contentLoadCallSpy.calledOnce, 'Pitäisi ladata sisältökerrokset uudelleen');
            return this.contentLoadCallSpy.firstCall.returnValue;
        }).then(() => {
            assert.ok(this.contentLayerLoadCallSpy.calledOnce, 'Pitäisi triggeröidä sisältökerroksen load uudelleen');
            assert.deepEqual(this.contentLayerLoadCallSpy.firstCall.args, [expectedLoadType],
                'Pitäisi passata sisältökerroksen LoadType:ksi ' + expectedLoadType
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
    function getInstantiatedLayers(rendered) {
        return ReactTestUtils.findRenderedComponentWithType(rendered, Content).contentLayers || [];
    }
    function isProbablyContentController(object) {
        return object instanceof Object && object.hasOwnProperty('refresh');
    }
    function isProbablyCalendarController(object) {
        return object instanceof Object && object.hasOwnProperty('changeView');
    }
});
