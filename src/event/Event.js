const Action = Object.freeze({
    EDIT: 'edit',
    DELETE: 'delete'
});

class Event extends React.Component {
    /**
     * @param {Object} props {
     *     event: {Object},
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
        return $el('div', {className: 'event'},
            $el('button', {title: 'Poista', onClick: e => this.receiveClick(Action.DELETE, e)}, 'x'),
            $el('button', {title: 'Muokkaa', onClick: e => this.receiveClick(Action.EDIT, e)}, 'e'),
            $el('span', null, this.props.event.title)
        );
    }
}

export default Event;
