const Action = Object.freeze({
    EDIT: 'edit',
    DELETE: 'delete'
});

class EventComponent extends React.Component {
    /**
     * @param {Object} props {
     *     event: {Event},
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
        return $el('div', {className: 'event stack-index-' + this.props.event.stackIndex + (
                this.props.event.end.getHours() - this.props.event.start.getHours() === 1 &&
                this.props.event.start.getDate() === this.props.event.end.getDate() ? ' incontinous' : ''
            )},
            $el('button', {title: 'Poista', onClick: e => this.receiveClick(Action.DELETE, e)}, 'x'),
            $el('button', {title: 'Muokkaa', onClick: e => this.receiveClick(Action.EDIT, e)}, 'e'),
            $el('span', null, this.props.event.title)
        );
    }
}

export default EventComponent;
