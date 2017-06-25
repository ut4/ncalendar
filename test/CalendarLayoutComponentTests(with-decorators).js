define(['src/ioc', 'src/CalendarLayout', 'src/Content', 'src/DateCursors', 'src/Constants', 'test/resources/Utils', 'test/resources/TestContentLayer'], (ioc, CalendarLayout, Content, DateCursors, Constants, Utils, TestContentLayer) => {
    'use strict';
    const domUtils = Utils.domUtils;
    ioc.default.contentLayerFactory().register('atest', TestContentLayer.default);
    QUnit.module('CalendarLayoutComponent(with-decorators)', hooks => {
        hooks.beforeEach(() => {
            this.contentLoadCallSpy = sinon.spy(Content.default.prototype, 'loadAsyncContent');
        });
        hooks.afterEach(() => {
            this.contentLoadCallSpy.restore();
        });
        const render = (contentLayers = ['atest']) => {
            return Inferno.TestUtils.renderIntoDocument($el(CalendarLayout.default, {settings: {
                defaultView: Constants.VIEW_WEEK,
                contentLayers: contentLayers
            }}));
        };
        QUnit.test('Lataa & ajaa sisältökerroksen', assert => {
            //
            const renderedRows = Inferno.TestUtils.scryRenderedDOMElementsWithClass(
                render(), 'main .row'
            );
            //
            assert.ok(this.contentLoadCallSpy.calledOnce, 'Pitäisi ladata sisältökerros');
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                const expectedDecorating = TestContentLayer.default.loadCount.toString();
                const decoratings = expectedDecorating.repeat(Constants.DAYS_IN_WEEK);
                assert.ok(
                    renderedRows.every(row => row.textContent.indexOf(decoratings) > -1),
                    'Jokainen solu pitäisi olla dekoroitu'
                );
                done();
            });
        });
        QUnit.test('Ei lataa sisältökerroksia jos niitä ei ole valittu', assert => {
            const rendered = render([]);
            // Triggöi navigaatiotapahtuma
            domUtils.findButtonByContent(rendered, '<').click();
            //
            assert.ok(this.contentLoadCallSpy.notCalled, 'Ei pitäisi ladata sisältökerroksia');
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
    });
});
