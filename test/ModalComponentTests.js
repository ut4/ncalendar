define(['src/Modal', 'src/ComponentConstruct'], (Modal, ComponentConstruct) => {
    'use strict';
    const itu = Inferno.TestUtils;
    const someComponent = () => $el('span', null, 'foo');
    QUnit.module('ModalComponent', () => {
        QUnit.test('.open renderöi sisällön, ja .close unrenderöi sen', assert => {
            const rendered = itu.renderIntoDocument($el(Modal.default));
            assert.equal(
                itu.findRenderedVNodeWithType(rendered, someComponent), undefined,
                'Ei pitäisi renderöidä oletuksena mitään'
            );
            // Avaa modal
            const modal = itu.findRenderedVNodeWithType(rendered, Modal.default);
            modal.children.open(new ComponentConstruct.default(someComponent));
            // Assertoi että renderöi
            assert.notEqual(
                itu.findRenderedVNodeWithType(rendered, someComponent), undefined,
                'Pitäisi renderöidä passattu vNode'
            );
            // Sulje modal
            modal.children.close();
            // Assertoi että sulkeutui
            assert.equal(
                itu.findRenderedVNodeWithType(rendered, someComponent), undefined,
                'Ei pitäisi renderöidä sulkemisen jälkeen mitään'
            );
        });
        QUnit.test('.open lisää renderöitävän sisällön propseihin funktion, jolla voi sulkea modalin', assert => {
            const rendered = itu.renderIntoDocument($el(Modal.default));
            const someComponentSpy = sinon.spy(someComponent);
            const modal = itu.findRenderedVNodeWithType(rendered, Modal.default);
            // Avaa modal
            modal.children.open(new ComponentConstruct.default(someComponentSpy));
            // Assertoi että incluudasi funktion
            const closeFnProp = someComponentSpy.firstCall.args[0].closeModal;
            assert.equal(typeof closeFnProp, 'function', 'Pitäisi lisätä propseihin closeModal-funktion');
            // Testaa että funktio sulkee modalin
            closeFnProp();
            assert.equal(
                itu.findRenderedVNodeWithType(rendered, someComponent), undefined,
                'props.closeModal pitäisi sulkea modalin'
            );
        });
    });
});
