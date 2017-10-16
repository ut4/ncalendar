import CalendarLayout from '../../src/CalendarLayout.js';
import {arrayUtils} from '../resources/utils.js';

const renderingTestUtils = {
    renderCalendarLayout(defaultView, defaultEvents, defaultDate) {
        return ReactTestUtils.renderIntoDocument(
            $el(CalendarLayout, {
                defaultView,
                defaultDate: new Date(defaultDate),
                extensions: ['event'],
                eventRepository: 'memory',
                eventRepositoryDefaultEvents: arrayUtils.shuffle(defaultEvents)
            })
        );
    },
    getRenderedEvents(rendered) {
        return ReactTestUtils.scryRenderedDOMComponentsWithClass(rendered, 'event');
    },
    /**
     * 1.5 -> calc(150% + 7.5px)
     */
    getExpectedEventStyle(expectedSizePercent, isSplit) {
        const paddingAndBorder = (expectedSizePercent - 100) * 0.05 + (isSplit ? 2 : 0);
        return `calc(${expectedSizePercent}% + ${paddingAndBorder}px)`;
    },
    getAllStackIndexes(renderedEvents) {
        return renderedEvents.reduce((a,b) => a.concat(b), []).map(el =>
            el.className.match(/stack-index-[0-9]/)[0]
        );
    }
};

export default renderingTestUtils;
