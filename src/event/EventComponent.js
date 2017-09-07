const Action = Object.freeze({
    EDIT: 'edit',
    DELETE: 'delete'
});

class EventComponent extends React.Component {
    /**
     * @param {Object} props {
     *     event: {Event},
     *     stackIndex: {number},
     *     cellPadding: {number},
     *     edit: {Function=},
     *     delete: {Function=}
     * }
     */
    constructor(props) {
        super(props);
    }
    /**
     * @access private
     */
    receiveClick(action, e) {
        e.stopPropagation();
        if (e.which && e.which !== 1) {
            return;
        }
        this.props[action](this.props.event, e);
    }
    /**
     */
    render() {
        return $el('div', {className: this.getClassNames(), style: this.getStyles()},
            $el('button', {title: 'Poista', onClick: e => this.receiveClick(Action.DELETE, e)}, 'x'),
            $el('button', {title: 'Muokkaa', onClick: e => this.receiveClick(Action.EDIT, e)}, 'e'),
            $el('span', null, this.props.event.title)
        );
    }
    /**
     * @access protected
     * @returns {string}
     */
    getClassNames() {
        const startMinutes = this.props.event.start.getMinutes();
        return 'event stack-index-' + this.props.stackIndex + (
            startMinutes > 0 ? ' start-minutes-' + toNearest15Min(startMinutes) : ''
        );
    }
    /**
     * @access protected
     * @returns {string}
     */
    getStyles() {
        const durationInSeconds = (this.props.event.end - this.props.event.start) / 1000;
        if (durationInSeconds === 3600) {
            return null;
        }
        const durationInHours = toNearestQuarter(durationInSeconds / 60 / 60);
        return `height: calc(${durationInHours * 100}% + ${this.getPaddingAndBorderDiff(durationInHours)}px)`;
    }
    /**
     * @access protected
     * @param {number} multiplier 1, 1.5, 2, 2.75 ...
     * @returns {number}
     */
    getPaddingAndBorderDiff(multiplier) {
        // 1 === border
        return (this.props.cellPadding * 2 + 1) * (multiplier - 1);
    }
}

class MonthEventComponent extends EventComponent {
    /**
     * @access protected
     * @returns {string}
     */
    getClassNames() {
        return (
            'event stack-index-' + this.props.stackIndex +
            (this.props.event.hasSpawning ? ' has-split-end' : '') +
            (this.props.event.isSpawning ? ' has-split-start' : '')
        );
    }
    /**
     * @access protected
     * @returns {string}
     */
    getStyles() {
        const e = this.props.event;
        const durationInDays = toNearestQuarter(((e.splitEnd || e.end) - e.start) / 1000 / 60 / 60 / 24);
        if (durationInDays === 1 && e.start.getMonth() === (e.splitEnd || e.end).getMonth()) {
            return null;
        }
        return `width: calc(${durationInDays * 100}% + ${this.getPaddingAndBorderDiff(durationInDays)}px)`;
    }
}

/**
 * 12 -> 15, 15 -> 15, 24 -> 30, 31 -> 30 jne..
 */
function toNearest15Min(minutes) {
    return Math.round(minutes / 15) * 15;
}

/**
 * 1.10 -> 1, 1.17 -> 1.25, 1.2 -> 1.25, 1.4 -> 1.5 jne..
 */
function toNearestQuarter(number) {
    return Math.round(number / 0.25) * 0.25;
}

export default EventComponent;
export { MonthEventComponent };
