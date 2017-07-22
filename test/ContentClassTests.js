import Content from '../src/Content.js';

QUnit.module('ContentClass', function (hooks) {
    hooks.beforeEach(() => {
        this.content = Object.create(Content.prototype);
    });
    QUnit.test('shouldComponentUpdate palauttaa false, jos sisältökerroksien lataus on käynnissä', assert => {
        const props = null;
        assert.equal(this.content.shouldComponentUpdate(props, {}), true,
            'Ei pitäisi disabloida renderöintiä, jos sisältökerroksia ei ole valittuna'
        );
        assert.equal(this.content.shouldComponentUpdate(props, {loading: false}), true,
            'Ei pitäisi disabloida renderöintiä, jos sisältökerroksien lataus ei ole käynnissä'
        );
        assert.equal(this.content.shouldComponentUpdate(props, {loading: true}), false,
            'Pitäisi disabloida renderöinti, jos sisältökerroksien lataus on käynnissä'
        );
    });
});
