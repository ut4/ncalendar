define(['src/ioc', 'test/resources/Utils', 'src/CalendarLayout', 'src/Content', 'src/event/EventLayer', 'src/event/InMemoryEventRepository'], (ioc, Utils, CalendarLayout, Content, EventLayer, InMemoryEventRepository) => {
    'use strict';
    const itu = Inferno.TestUtils;
    const now = new Date();
    const testEvents = [
        {date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 1), title: 'Event 1'},
        {date: new Date(now.getFullYear(), now.getMonth(), now.getDate()-7, 0, 0, 0, 1), title: 'Event 2'},
        {date: new Date(now.getFullYear(), now.getMonth()-1, now.getDate(), 0, 0, 0, 1), title: 'Event 3'}
    ];
    const repository = new InMemoryEventRepository.default(testEvents);
    class EventLayerWithInitialEvents extends EventLayer.default {
        constructor() {
            super(repository, ...arguments);
        }
    }
    //
    ioc.default.contentLayerFactory().register('eventasd', EventLayerWithInitialEvents);
    //
    QUnit.module('event/CalendarLayoutComponent(with-eventlayer)', hooks => {
        hooks.beforeEach(() => {
            this.contentLoadCallSpy = sinon.spy(Content.default.prototype, 'loadAsyncContent');
            this.rendered = itu.renderIntoDocument(
                $el(CalendarLayout.default, {settings: {
                    contentLayers: ['eventasd']
                }})
            );
        });
        hooks.afterEach(() => {
            this.contentLoadCallSpy.restore();
        });
        QUnit.test('renderöi load:issa haetut eventit kalenteriin', assert => {
            //
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                const events = getRenderedEvents(this.rendered);
                assert.equal(events.length, 1);
                assert.ok(
                    new RegExp(testEvents[0]).test(events[0].textContent),
                    'Pitäisi renderöidä oikean tapahtuman'
                );
                done();
            });
        });
        QUnit.test('solua klikkaamalla voi luoda uuden tapahtuman', assert => {
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                const hourRows = getRenderedRows(this.rendered);
                const renderedEventCountBefore = getRenderedEvents(this.rendered).length;
                const repositoryInsertSpy = sinon.spy(repository, 'insert');
                // Triggeröi klikkaus
                const mondayAt0Am = hourRows[0].children[1].children[0];
                mondayAt0Am.click();
                const inputs = getRenderedInputs(this.rendered);
                assert.equal(inputs.length, 2, 'Pitäisi avata modalin');
                const data = {title: 'Foo', date: getSomeDateString()};
                // Triggeröi lomakkeen submit
                inputs[0].value = data.title; Utils.domUtils.triggerEvent('input', inputs[0]);
                inputs[1].value = data.date; Utils.domUtils.triggerEvent('input', inputs[1]);
                Utils.domUtils.findButtonByContent(this.rendered, 'Ok').click();
                // Assertoi että luo tapahtuman ja renderöi sen kalenteriin
                assert.equal(getRenderedInputs(this.rendered).length, 0, 'Pitäisi sulkea modalin');
                assert.ok(repositoryInsertSpy.calledOnce, 'Pitäisi kutsua repository.insert');
                assert.deepEqual(repositoryInsertSpy.firstCall.args, [{title: data.title, date: new Date(data.date)}],
                    'Pitäisi passata repository.insert:lle lomakedatan'
                );
                repositoryInsertSpy.firstCall.returnValue.then(() => {
                    const renderedEventsAfter = getRenderedEvents(this.rendered);
                    assert.equal(renderedEventsAfter.length, renderedEventCountBefore + 1,
                        'Pitäisi lisätä luotu tapahtuma kalenteriin'
                    );
                    assert.ok(
                        hourRows[2].contains(renderedEventsAfter[1]),
                        'Pitäisi renderöidä uusi tapahtuma oikealle tuntiriville'
                    );
                    done();
                });
            });
        });
        QUnit.test('renderöidyn tapahtuman edit-nappia klikkaamalla voi muokata tapahtumaa', assert => {
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                const hourRows = getRenderedRows(this.rendered);
                const renderedEvents = getRenderedEvents(this.rendered);
                const renderedEventCountBefore = renderedEvents.length;
                const renderedEventContentBefore = renderedEvents[0].textContent;
                const renderedEventParenBefore = renderedEvents[0].parentNode;
                const repositoryUpdateSpy = sinon.spy(repository, 'update');
                // Triggeröi klikkaus
                const eventEditButton = renderedEvents[0].querySelector('button[title="Muokkaa"]');
                eventEditButton.click();
                const inputs = getRenderedInputs(this.rendered);
                assert.equal(inputs.length, 2, 'Pitäisi avata modalin');
                // Simuloi lomakkeen submit
                const data = {title: 'Holyy', date: getSomeDateString()};
                inputs[0].value = data.title; Utils.domUtils.triggerEvent('input', inputs[0]);
                inputs[1].value = data.date; Utils.domUtils.triggerEvent('input', inputs[1]);
                const expectedCurrentEvent = testEvents[0];
                Utils.domUtils.findButtonByContent(this.rendered, 'Ok').click();
                // Assertoi että päivitti tapahtuman ja uudelleenrenderöi kalenterin oikein
                assert.equal(getRenderedInputs(this.rendered).length, 0, 'Pitäisi sulkea modalin');
                assert.ok(repositoryUpdateSpy.calledOnce, 'Pitäisi kutsua repository.update');
                assert.deepEqual(repositoryUpdateSpy.firstCall.args, [expectedCurrentEvent, {
                    title: data.title,
                    date: new Date(data.date)
                }], 'Pitäisi passata repository.update:lle nykyisen eventin, ja lomakedatan');
                repositoryUpdateSpy.firstCall.returnValue.then(() => {
                    const renderedEventsAfter = getRenderedEvents(this.rendered);
                    assert.equal(renderedEventsAfter.length, renderedEventCountBefore,
                        'Ei pitäisi lisätä eikä poistaa tapahtumia kalenterista'
                    );
                    assert.notEqual(
                        renderedEventsAfter[0].textContent,
                        renderedEventContentBefore,
                        'Pitäisi päivittää eventin sisällön'
                    );
                    assert.notDeepEqual(
                        renderedEventsAfter[0].parentNode,
                        renderedEventParenBefore,
                        'Pitäisi siirtää tapahtuma uuteen soluun'
                    );
                    assert.ok(
                        hourRows[2].contains(renderedEventsAfter[0]),
                        'Pitäisi siirtää tapahtuma oikeaan soluun'
                    );
                    done();
                });
            });
        });
        QUnit.test('renderöidyn tapahtuman delete-nappia klikkaamalla voi poistaa tapahtuman', assert => {
            const done = assert.async();
            this.contentLoadCallSpy.firstCall.returnValue.then(() => {
                const renderedEvents = getRenderedEvents(this.rendered);
                const renderedEventCountBefore = renderedEvents.length;
                const expectedDeleteData = testEvents[0];
                const repositoryDeleteSpy = sinon.spy(repository, 'delete');
                // Triggeröi klikkaus
                const deleteEditButton = renderedEvents[0].querySelector('button[title="Poista"]');
                deleteEditButton.click();
                // Assertoi että poistaa tapahtuman ja uudelleenrenderöi kalenterin
                assert.ok(repositoryDeleteSpy.calledOnce, 'Pitäisi kutsua repository.delete');
                assert.deepEqual(
                    repositoryDeleteSpy.firstCall.args,
                    [expectedDeleteData],
                    'Pitäisi passata repository.delete:lle oikean tapahtuman'
                );
                repositoryDeleteSpy.firstCall.returnValue.then(() => {
                    const renderedEventsAfter = getRenderedEvents(this.rendered);
                    assert.equal(renderedEventsAfter.length, renderedEventCountBefore - 1,
                        'Pitäisi poistaa tapahtuman kalenterista'
                    );
                    done();
                });
            });
        });
    });
    function getRenderedInputs(rendered) {
        return itu.scryRenderedDOMElementsWithTag(rendered, 'input');
    }
    function getRenderedEvents(rendered) {
        return itu.scryRenderedDOMElementsWithClass(rendered, 'event');
    }
    function getRenderedRows(rendered) {
        return itu.findRenderedDOMElementWithClass(rendered, 'main').children;
    }
    function getSomeDateString(hour = 2) {
        const date = new Date(testEvents[0].date);
        date.setHours(hour);
        return date.toISOString();
    }
});