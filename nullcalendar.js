import CalendarLayout from './src/CalendarLayout.js';
import ExtensionFactory from './src/ExtensionFactory.js';

const extensionFactory = new ExtensionFactory();

/**
 * Kirjaston public API.
 */
export default {
    /**
     * @param {HTMLElement} el DOM-elementti, johon kalenteri renderöidään
     * @param {Object=} settings Kalenterin konfiguraatio
     * @returns {Object} Kalenteri-instanssin kontrolleri/API
     */
    newCalendar: (el, settings) => {
        return ReactDOM.render($el(CalendarLayout, settings), el).getController();
    },
    /**
     * @param {string} name Nimi, jolla rekisteröidään
     * @param {Object|Function} extension Laajennoksen implementaatio @see https://github.com/ut4/ncalendar#extending
     */
    registerExtension: (name, extension) => extensionFactory.add(name, extension),
    /**
     * @prop {React.Component} Kalenterin juurikomponentti @see https://github.com/ut4/ncalendar#usage-jsx
     */
    Calendar: CalendarLayout
};
