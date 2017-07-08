define(() => {
    'use strict';
    /*
     * Tapahtuman luonti-, ja muokkausnäkymä.
     */
    class EventModal extends React.Component {
        /**
         * @param {Object} props {
         *     event: {Object},
         *     confirm: {Function},
         *     closeModal: Function
         * }
         */
        constructor(props) {
            super(props);
            this.state = {
                title: this.props.event.title,
                date: this.props.event.date.toISOString()
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
            this.props.confirm({
                title: this.state.title,
                date: this.state.date
            });
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
                $el('h3', null, !this.props.event.title ? 'Luo uusi tapahtuma' : 'Muokkaa tapahtumaa'),
                $el('input', {value: this.state.title, [React.ON_INPUT]: e => this.receiveInputValue(e.target), name: 'title'}),
                $el('input', {value: this.state.date, [React.ON_INPUT]: e => this.receiveInputValue(e.target), name: 'date', type: 'date'}),
                $el('button', {onClick: () => this.confirm()}, 'Ok'),
                $el('button', {onClick: () => this.cancel()}, 'Peruuta')
            );
        }
    }
    return {default: EventModal};
});