define(['src/Constants', 'src/DateCursors', 'src/Layout', 'src/Header', 'src/Toolbar', 'src/Content'], (Constants, DateCursors, Layout, Header, Toolbar, Content) => {
    'use strict';
    QUnit.module('LayoutComponent', () => {
        QUnit.test('renderöi layoutin props.currentView -muodossa', assert => {
            const expectedView = Constants.VIEW_DAY;
            const rendered = Inferno.TestUtils.renderIntoDocument($el(Layout.default, {
                currentView: expectedView,
                dateCursor: DateCursors.dateCursorFactory.newCursor(expectedView),
                titleFormatters: {}
            }));
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Header[expectedView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Content[expectedView]), undefined);
        });
    });
});
