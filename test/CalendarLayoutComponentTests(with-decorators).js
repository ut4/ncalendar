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
            return Inferno.TestUtils.renderIntoDocument($el(CalendarLayout.default, {settings: {
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
                const expectedDecorating = expectedTestLayer.loadCount.toString();
                const decoratings = expectedDecorating.repeat(Constants.DAYS_IN_WEEK);
                assert.ok(
                    renderedRows.every(row => row.textContent.indexOf(decoratings) > -1),
                    'Jokainen solu pitäisi olla dekoroitu'
                );
                done();
            });
        });
        QUnit.test('Kutsuu rekisteröityjä clickHandlereita', assert => {
            const rendered = render();
            //
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                const renderedRows = getRenderedRows(rendered);
                // .row        .col(ma)    .cell
                renderedRows[0].children[1].children[0].click(); // ma, pitäisi olla klikattava
                renderedRows[0].children[2].children[0].click(); // ti, ei pitäisi olla klikattava
                assert.ok(
                    this.clickHandlerSpy.calledOnce,
                    'Olisi pitänyt rekisteröidä handlerin ensimmäiseen celliin'
                );
                assert.deepEqual(2, this.clickHandlerSpy.firstCall.args.length);
                assert.ok(
                    this.clickHandlerSpy.firstCall.args[0] instanceof Content.Cell,
                    'Handlerin 1. argumentti pitäis olla Cell-instanssi'
                );
                assert.ok(
                    this.clickHandlerSpy.firstCall.args[1] instanceof Event,
                    'Handlerin 2. argumentti pitäis olla click-event'
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
            domUtils.findButtonByContent(rendered, '<').click();
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
                domUtils.findButtonByContent(rendered, buttonContent).click();
                //
                assert.ok(this.contentLoadCallSpy.calledOnce, 'Pitäisi ladata sisältökerros uudelleen');
                return this.contentLoadCallSpy.firstCall.returnValue;
            }).then(() => {
                const contentAfter = domUtils.getElementContent(rendered, '.main');
                assert.notEqual(contentAfter, contentBefore);
                done();
            });
        }
        function getRenderedRows(rendered) {
            return Array.prototype.slice.call(Inferno.TestUtils.scryRenderedDOMElementsWithClass(
                rendered, 'row'
            )).slice(2);// toolbarin, ja headerin rivit pois
        }
        function getInstantiatedLayers(rendered) {
            return Inferno.TestUtils.findRenderedVNodeWithType(rendered, Content.default).children.contentLayers || [];
        }
        function isProbablyContentController(object) {
            return object instanceof Object && object.hasOwnProperty('update');
        }
        function isProbablyCalendarController(object) {
            return object instanceof Object && object.hasOwnProperty('changeView');
        }
    });
});
