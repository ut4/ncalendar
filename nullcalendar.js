import CalendarLayout from './src/CalendarLayout.js';
import ContentLayerFactory from './src/ContentLayerFactory.js';

const contentLayerFactory = new ContentLayerFactory();

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
        return ReactDOM.render($el(CalendarLayout, settings), el).getController();
    },
    /**
     * @param {string} name Nimi, jolla rekisteröidään
     * @param {Object|Function} layer Sisältökerroksen implementaatio @see https://github.com/ut4/ncalendar#extending
     */
    registerContentLayer: (name, layer) => contentLayerFactory.register(name, layer),
    /**
     * @prop {React.Component} Kalenterin juurikomponentti @see https://github.com/ut4/ncalendar#usage-jsx
     */
    Calendar: CalendarLayout
};
