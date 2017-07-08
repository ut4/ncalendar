define(['src/Modal', 'src/ComponentConstruct'], (Modal, ComponentConstruct) => {
    'use strict';
    const rtu = ReactTestUtils;
    class SomeModalContent extends React.Component {
        render() {
            return $el('span', null, 'foo');
        }
    }
    QUnit.module('ModalComponent', () => {
        QUnit.test('.open renderöi sisällön, ja .close unrenderöi sen', assert => {
            const rendered = rtu.renderIntoDocument($el(Modal.default));
            assert.equal(
                rtu.scryRenderedComponentsWithType(rendered, SomeModalContent).length, 0,
                'Ei pitäisi renderöidä oletuksena mitään'
            );
            // Avaa modal
            const modal = rtu.findRenderedComponentWithType(rendered, Modal.default);
            modal.open(new ComponentConstruct.default(SomeModalContent));
            // Assertoi että renderöi
            assert.notEqual(
                rtu.scryRenderedComponentsWithType(rendered, SomeModalContent).length, 0,
                'Pitäisi renderöidä passattu vNode'
            );
            // Sulje modal
            modal.close();
            // Assertoi että sulkeutui
            assert.equal(
                rtu.scryRenderedComponentsWithType(rendered, SomeModalContent).length, 0,
                'Ei pitäisi renderöidä sulkemisen jälkeen mitään'
            );
        });
        QUnit.test('.open lisää renderöitävän sisällön propseihin funktion, jolla voi sulkea modalin', assert => {
            const rendered = rtu.renderIntoDocument($el(Modal.default));
            const modal = rtu.findRenderedComponentWithType(rendered, Modal.default);
            // Avaa modal
            modal.open(new ComponentConstruct.default(SomeModalContent));
            // Assertoi että incluudasi funktion
            const renderedSomeModalContent = rtu.findRenderedComponentWithType(rendered, SomeModalContent);
            const closeFnProp = renderedSomeModalContent.props.closeModal;
            assert.equal(typeof closeFnProp, 'function', 'Pitäisi lisätä propseihin closeModal-funktion');
            // Testaa että funktio sulkee modalin
            closeFnProp();
            assert.equal(
                rtu.scryRenderedComponentsWithType(rendered, SomeModalContent).length, 0,
                'props.closeModal pitäisi sulkea modalin'
            );
        });
    });
});
