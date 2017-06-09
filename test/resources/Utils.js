define(() => {
    'use strict';
    const domUtils = {
        /**
         * Palauttaa ensimmäisen löytämänsä {tag}-elementin sisällön
         * (textContent).
         */
        getTagElementContent: (rendered, tag) => Inferno.TestUtils.findRenderedDOMElementWithTag(rendered, tag).textContent,
        /**
         * Palauttaa ensimmäisen löytämänsä <button>-elementin, jonka
         * textContent on täysin sama kuin {content}.
         */
        findButtonByContent: (rendered, content) => {
            const allButtons = Inferno.TestUtils.scryRenderedDOMElementsWithTag(rendered, 'button');
            return Array.from(allButtons).find(el => el.textContent === content);
        }
    };
    return {domUtils};
});