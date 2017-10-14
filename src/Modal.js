/*
 * Kalenterikontrolleri/API:n kautta avattava/suljettava näkymä, johon voidaan
 * ladata custom-sisältöä.
 */
class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {contentConstruct: null};
    }
    /**
     * @access public
     * @param {ComponentConstruct} construct
     */
    open(construct) {
        this.setState({contentConstruct: construct});
    }
    /**
     * @access public
     */
    close() {
        this.setState({contentConstruct: null});
    }
    /**
     * Renderöi modalin, tai ei tee mitään jos sisältöa ei ole asetettu.
     */
    render() {
        return this.state.contentConstruct
            ? $el('div', {className: 'modal'},
                $el('div', {className: 'modal-content'},
                    $el(
                        this.state.contentConstruct.Component,
                        Object.assign({}, this.state.contentConstruct.props, {
                            closeModal: () => this.close()
                        })
                    )
                )
            )
            : null;
    }
}

export default Modal;
