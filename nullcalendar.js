define(['src/CalendarLayout', 'src/ioc'], (CalendarLayout, ioc) => {
    'use strict';
    const contentLayerFactory = ioc.default.contentLayerFactory();
    /**
     * Yksittäisen kalenteri-instanssin public API.
     */
    function Nullcalendar(component) {
        this.currentView = component.currentView;
        this.dateCursor = component.dateCursor;
        this.settings = component.settings;
        this.changeView = to => {
            return component.changeView(to);
        };
    }
    /**
     * Kirjaston public API.
     */
    return {
        /**
         * @param {HTMLElement} el DOM-elementti johon kalenteri renderöidään
         * @param {Object} settings Kalenterin configuraatio
         */
        newCalendar: (el, settings) =>
            new Nullcalendar(Inferno.render($el(CalendarLayout.default, settings), el)),
        /**
         * @param {string} name Nimi, jolla rekisteröidään
         * @param {Object} Class Implementaatio
         */
        registerContentLayer: (name, Class) =>
            contentLayerFactory.register(name, Class)
    };
});