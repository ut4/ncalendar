import Content from '../src/Content.js';

QUnit.module('ContentClass', function (hooks) {
    hooks.beforeEach(() => {
        this.content = Object.create(Content.prototype);
    });
    QUnit.test('shouldComponentUpdate palauttaa false, jos yhdelläkään laajennoksella ei ollut sisältöä', assert => {
        const props = null;
        assert.equal(this.content.shouldComponentUpdate(props, {currentlyHasAsyncContent: undefined}), true,
            'Ei pitäisi disabloida renderöintiä, jos ei ole tietoa onko sisältöä ladattu'
        );
        assert.equal(this.content.shouldComponentUpdate(props, {currentlyHasAsyncContent: true}), true,
            'Ei pitäisi disabloida renderöintiä, jos sisältöä on ladattu'
        );
        assert.equal(this.content.shouldComponentUpdate(props, {currentlyHasAsyncContent: false}), false,
            'Pitäisi disabloida renderöinti, jos sisätöä ei löytynyt'
        );
    });
});
