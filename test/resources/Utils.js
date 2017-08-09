import Dateutils from '../../src/DateUtils.js';

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

const dateUtils = new Dateutils();

const arrayUtils = {
    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shuffle: array => {
        let currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
};

export {domUtils, dateUtils, arrayUtils};
