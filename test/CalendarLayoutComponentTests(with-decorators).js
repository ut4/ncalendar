define(['src/ioc', 'src/CalendarLayout', 'src/Content', 'src/DateCursors', 'src/Constants', 'test/resources/Utils', 'test/resources/TestContentLayer'], (ioc, CalendarLayout, Content, DateCursors, Constants, Utils, TestContentLayer) => {
    'use strict';
    const domUtils = Utils.domUtils;
    ioc.default.contentLayerFactory().register('atest', TestContentLayer.default);
    QUnit.module('CalendarLayoutComponent(with-decorators)', hooks => {
        hooks.beforeEach(() => {
            this.contentLoadCallSpy = sinon.spy(Content.default.prototype, 'loadAsyncContent');
            this.clickHandlerSpy = sinon.spy(TestContentLayer.default, 'testClickHandler');
        });
        hooks.afterEach(() => {
            this.contentLoadCallSpy.restore();
            TestContentLayer.default.testClickHandler.restore();
        });
        const render = (contentLayers = ['atest']) => {
            return ReactTestUtils.renderIntoDocument($el(CalendarLayout.default, {settings: {
                defaultView: Constants.VIEW_WEEK,
                contentLayers: contentLayers
            }}));
        };
        QUnit.test('Instantioi & lataa & ajaa sisältökerroksen', assert => {
            const rendered = render();
            const expectedTestLayer = getInstantiatedLayers(rendered)[0];
            assert.ok(
                expectedTestLayer instanceof TestContentLayer.default,
                'Pitäisi instantioida sisältökerros'
            );
            assert.ok(
                isProbablyContentController(expectedTestLayer.args[0]),
                'Layerin 1. argumentti pitäisi olla contentController'
            );
            assert.ok(
                isProbablyCalendarController(expectedTestLayer.args[1]),
                'Layerin 2. argumentti pitäisi olla calendarController'
            );
            //
            assert.ok(this.contentLoadCallSpy.calledOnce, 'Pitäisi ladata sisältökerros');
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                const renderedRows = getRenderedRows(rendered);
                assert.equal(Constants.HOURS_IN_DAY, renderedRows.length);
                assert.ok(
                    isEveryCellDecoratedWith(rendered, expectedTestLayer.loadCount),
                    'Jokainen solu pitäisi olla dekoroitu'
                );
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
                expectedTestLayer.triggerContentRefresh();
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
                assert.deepEqual(2, this.clickHandlerSpy.firstCall.args.length);
                assert.ok(
                    this.clickHandlerSpy.firstCall.args[0] instanceof Content.Cell,
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
            assert.equal(0, getInstantiatedLayers(rendered).length,
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
            testButtonClickTriggersDecoratorRefresh.call(this, '>', assert);
        });
        QUnit.test('Toolbarin prev-sivutuspainike triggeröi sisältökerroksen päivityksen', assert => {
            testButtonClickTriggersDecoratorRefresh.call(this, '<', assert);
        });
        QUnit.test('Toolbarin näkymänvaihtopainike triggeröi sisältökerroksen päivityksen', assert => {
            testButtonClickTriggersDecoratorRefresh.call(this, 'Kuukausi', assert);
        });
        function testButtonClickTriggersDecoratorRefresh(buttonContent, assert) {
            let contentBefore;
            const rendered = render();
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                contentBefore = domUtils.getElementContent(rendered, '.main');
                this.contentLoadCallSpy.reset();
                // Triggöi navigaatiotapahtuma
                ReactTestUtils.Simulate.click(domUtils.findButtonByContent(rendered, buttonContent));
                //
                assert.ok(this.contentLoadCallSpy.calledOnce, 'Pitäisi ladata sisältökerros uudelleen');
                return this.contentLoadCallSpy.firstCall.returnValue;
            }).then(() => {
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
            return ReactTestUtils.findRenderedComponentWithType(rendered, Content.default).contentLayers || [];
        }
        function isProbablyContentController(object) {
            return object instanceof Object && object.hasOwnProperty('refresh');
        }
        function isProbablyCalendarController(object) {
            return object instanceof Object && object.hasOwnProperty('changeView');
        }
    });
});
