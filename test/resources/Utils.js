define(() => {
    'use strict';
    const domUtils = {
        /**
         * Palauttaa ensimmäisen löytämänsä {tag}-elementin sisällön
         * (textContent).
         */
        getElementContent: (rendered, tagOrClass) => tagOrClass.charAt(0) !== '.'
            ? ReactTestUtils.findRenderedDOMComponentWithTag(rendered, tagOrClass).textContent
            : ReactTestUtils.findRenderedDOMComponentWithClass(rendered, tagOrClass.substr(1)).textContent,
        /**
         * Palauttaa ensimmäisen löytämänsä <button>-elementin, jonka
         * textContent on täysin sama kuin {content}.
         */
        findButtonByContent: (rendered, content) => {
            const allButtons = ReactTestUtils.scryRenderedDOMComponentsWithTag(rendered, 'button');
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