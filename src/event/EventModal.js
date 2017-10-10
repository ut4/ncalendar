class EventModal extends React.Component {
    /**
     * @param {Object} props {
     *     event: {Event},
     *     onConfirm: {Function},
     *     closeModal: {Function},
     *     onDelete: {Function=}
     * }
     */
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.event.title,
            start: this.props.event.start.toISOString(),
            end: this.props.event.end.toISOString()
        };
    }
    /**
     * @access private
     */
    receiveInputValue(input) {
        this.setState({[input.name]: input.value});
    }
    /**
     * @access private
     */
    confirm() {
        this.props.event.setTitle(this.state.title);
        this.props.event.setStart(this.state.start);
        this.props.event.setEnd(this.state.end);
        this.props.onConfirm(this.props.event);
        this.props.closeModal();
    }
    /**
     * @access private
     */
    delete(e) {
        e.preventDefault();
        this.props.onDelete(this.props.event);
        this.props.closeModal();
    }
    /**
     * @access private
     */
    cancel() {
        this.props.closeModal();
    }
    /**
     */
    render() {
        return $el('div', null,
            $el('h3', null, !this.props.event.title ? 'Luo uusi tapahtuma' : ['Muokkaa tapahtumaa',
                $el('a', {href: '', title: 'Poista tapahtuma', onClick: e => this.delete(e), key: 'dl' }, 'Poista tapahtuma')
            ]),
            $el('input', {value: this.state.title, [React.ON_INPUT]: e => this.receiveInputValue(e.target), name: 'title'}),
            $el('input', {value: this.state.start, [React.ON_INPUT]: e => this.receiveInputValue(e.target), name: 'start', type: 'date'}),
            $el('input', {value: this.state.end, [React.ON_INPUT]: e => this.receiveInputValue(e.target), name: 'end', type: 'date'}),
            $el('button', {onClick: () => this.confirm()}, 'Ok'),
            $el('button', {onClick: () => this.cancel()}, 'Peruuta')
        );
    }
}

export default EventModal;
