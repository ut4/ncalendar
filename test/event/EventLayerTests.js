define(['src/event/EventLayer', 'src/event/InMemoryEventRepository'], (EventLayer, InMemoryEventRepository) => {
    'use strict';
    QUnit.module('event/EventLayer', hooks => {
        hooks.beforeEach(() => {
            this.repository = new InMemoryEventRepository.default();
            this.fakeCalendarController = {dateCursor: {range: {}}};
            this.eventLayer = new EventLayer.default(this.repository, null, this.fakeCalendarController);
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
});