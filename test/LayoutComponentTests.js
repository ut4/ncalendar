define(['src/Calendar', 'src/Layout', 'src/Header', 'src/Toolbar', 'src/Content'], (Calendar, Layout, Header, Toolbar, Content) => {
    'use strict';
    QUnit.module('LayoutComponent', () => {
        QUnit.test('renderöi layoutin Calendar.views.DEFAULT-muodossa', assert => {
            const rendered = Inferno.TestUtils.renderIntoDocument($el(Layout.default));
            const expectedView = Calendar.views.DEFAULT;
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Toolbar.default), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Header[expectedView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Content[expectedView]), undefined);
        });
        QUnit.test('renderöi layoutin props.currentView -muodossa', assert => {
            const expectedView = Calendar.views.DAY;
            const rendered = Inferno.TestUtils.renderIntoDocument($el(Layout.default, {currentView: expectedView}));
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Header[expectedView]), undefined);
            assert.notEqual(Inferno.TestUtils.findRenderedVNodeWithType(rendered, Content[expectedView]), undefined);
        });
    });
});
