import EventLayer from '../../src/event/EventLayer.js';
import InMemoryEventRepository from '../../src/event/InMemoryEventRepository.js';

QUnit.module('event/EventLayer', function(hooks) {
    hooks.beforeEach(() => {
        this.repository = new InMemoryEventRepository();
        this.fakeCalendarController = {dateCursor: {range: {}}};
        this.eventLayer = new EventLayer(this.repository, null, this.fakeCalendarController);
    });
    QUnit.test('Load normalisoi repositoryn palauttamat eventit', assert => {
        const someEvents = [
            {date: (new Date()).getTime()},
            {date: (new Date()).toISOString()}
        ];
        sinon.stub(this.repository, 'getAll').returns(Promise.resolve(someEvents));
        //
        const done = assert.async();
        this.eventLayer.load().then(() => {
            assert.ok(
                this.eventLayer.events.every(ev => ev.date instanceof Date),
                'Pitäisi muuntaa jokaisen event.daten tyypiksi Date'
            );
            done();
        });
    });
});
