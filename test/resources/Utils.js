define(() => {
    'use strict';
    const domUtils = {
        /**
         * Palauttaa ensimmäisen löytämänsä {tag}-elementin sisällön
         * (textContent).
         */
        getElementContent: (rendered, tagOrClass) => tagOrClass.charAt(0) !== '.'
            ? Inferno.TestUtils.findRenderedDOMElementWithTag(rendered, tagOrClass).textContent
            : Inferno.TestUtils.findRenderedDOMElementWithClass(rendered, tagOrClass.substr(1)).textContent,
        /**
         * Palauttaa ensimmäisen löytämänsä <button>-elementin, jonka
         * textContent on täysin sama kuin {content}.
         */
        findButtonByContent: (rendered, content) => {
            const allButtons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(rendered, 'button');
            return Array.from(allButtons).find(el => el.textContent === content);
        },
        /**
         * Triggeröi DOM-tapahtuma {eventType} elementissä {el}.
         */
        triggerEvent: (eventType, el) => {
            const event = document.createEvent('HTMLEvents');
            event.initEvent(eventType, false, true);
            el.dispatchEvent(event);
        }
    };
    return {domUtils};
});