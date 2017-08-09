import Event from '../../src/event/Event.js';

QUnit.module('event/Event', function() {
    QUnit.test('construct normalisoi datan', assert => {
        const instance1 = new Event({start: (new Date()).getTime(), end: (new Date()).getTime() + 1, id: 'fo'});
        const instance2 = new Event({start: (new Date()).toISOString()});
        //
        assert.ok(instance1.start instanceof Date,
            'Pitäisi muuntaa event.startin tyypiksi Date'
        );
        assert.ok(instance1.end instanceof Date,
            'Pitäisi muuntaa event.end tyypiksi Date'
        );
        assert.ok(instance2.start instanceof Date,
            'Pitäisi muuntaa event.startin tyypiksi Date'
        );
        assert.ok(instance2.end instanceof Date,
            'Pitäisi asettaa end, jos sitä ei ole määritelty'
        );
        assert.ok(instance2.hasOwnProperty('id'),
            'Pitäisi asettaa eventille id, jos ei ole valmiiksi'
        );
    });
});
