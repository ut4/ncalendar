define(['src/CalendarLayout', 'src/ioc'], (CalendarLayout, ioc) => {
    'use strict';
    const contentLayerFactory = ioc.default.contentLayerFactory();
    /**
     * Kirjaston public API.
     */
    return {
        /**
         * @param {HTMLElement} el DOM-elementti johon kalenteri renderöidään
         * @param {Object} settings Kalenterin configuraatio
         * @return {Object} Kalenteri-instanssin kontrolleri/API
         */
        newCalendar: (el, settings) => {
            return ReactDOM.render($el(CalendarLayout.default, settings ? {settings} : undefined), el).getController();
        },
        /**
         * @param {string} name Nimi, jolla rekisteröidään
         * @param {Object} Class Sisältökerroksen implementaatio
         */
        registerContentLayer: (name, Class) =>
            contentLayerFactory.register(name, Class)
    };
});