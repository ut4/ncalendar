import './app-header.js';
import CalendarLayout from './src/CalendarLayout.js';
import ioc from './src/ioc.js';
const contentLayerFactory = ioc.contentLayerFactory();

/**
 * Kirjaston public API.
 */
export default {
    /**
     * @param {HTMLElement} el DOM-elementti, johon kalenteri renderöidään
     * @param {Object=} settings Kalenterin configuraatio
     * @returns {Object} Kalenteri-instanssin kontrolleri/API
     */
    newCalendar: (el, settings) => {
        return ReactDOM.render($el(CalendarLayout, settings ? {settings} : undefined), el).getController();
    },
    /**
     * @param {string} name Nimi, jolla rekisteröidään
     * @param {Object} Class Sisältökerroksen implementaatio @see https://github.com/ut4/ncalendar#extending
     */
    registerContentLayer: (name, Class) =>
        contentLayerFactory.register(name, Class),
    /**
     * @prop {React.Component} Kalenterin juurikomponentti @see https://github.com/ut4/ncalendar#usage-jsx
     */
    Calendar: CalendarLayout
};
