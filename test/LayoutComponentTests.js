define(['src/Constants', 'src/Layout', 'src/Header', 'src/Toolbar', 'src/Content'], (Constants, Layout, Header, Toolbar, Content) => {
    'use strict';
    QUnit.module('LayoutComponent', () => {
        QUnit.test('renderöi layoutin props.currentView -muodossa', assert => {
            const expectedView = Constants.VIEW_DAY;
            const rendered = Inferno.TestUtils.renderIntoDocument($el(Layout.default, {
                currentView: expectedView,
                dateCursor: {range: {start: new Date(), end: new Date()}}
            }));
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Header[expectedView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Content[expectedView]), undefined);
        });
    });
});
