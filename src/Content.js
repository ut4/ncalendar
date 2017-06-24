define(['src/Constants', 'src/ioc'], (Constants, ioc) => {
    'use strict';
    const HOURS_ARRAY = Array.from(Array(Constants.HOURS_IN_DAY).keys());
    /*
     * Kalenterin pääsisältö, renderöi ViewLayoutin generoiman gridin, ja lisää
     * valittujen sisältökerroksien (jos niitä on) luoman sisällön gridin soluihin.
     *  ___________________________
     * |__________Toolbar__________|
     * |__________Header___________|
     * |                           |
     * |      --> Content <--      |
     * |___________________________|
     */
    class Content extends Inferno.Component {
        /**
         * @param {object} props {
         *     grid: {Array},
         *     selectedContentLayers: {Array},
         *     dateCursor: {DateCursor},
         *     currentView: {string},
         *     isMobileViewEnabled: {boolean}
         * }
         */
        constructor(props) {
            super(props);
            this.state = {};
            this.contentLayerFactory = ioc.default.contentLayerFactory();
            this.hasAsyncContent = this.props.selectedContentLayers.length > 0;
            if (this.hasAsyncContent) {
                this.contentLayers = this.props.selectedContentLayers.map(name =>
                    this.contentLayerFactory.make(name, [
                        this.props.dateCursor,
                        this.props.currentView,
                        this.props.isMobileViewEnabled
                    ])
                );
                this.loadAsyncContent();
            }
        }
        /**
         * Triggeröi sisältökerroksien päivityksen, jos niitä on.
         */
        componentWillReceiveProps(props) {
            if (this.hasAsyncContent) {
                this.setState({loading: true});
                this.loadAsyncContent(props);
            }
        }
        /**
         * Lataa & ajaa sisältökerrokset, esim. eventLayerin tapahtumat.
         *
         * @access private
         */
        loadAsyncContent(newProps) {
            if (newProps) {
                this.contentLayers.map(l => {
                    l.dateCursor = newProps.dateCursor;
                    l.currentView = newProps.currentView;
                    l.isMobileViewEnabled = newProps.isMobileViewEnabled;
                });
            }
            return Promise.all(this.contentLayers.map(l => l.load())).then(() => {
                this.applyAsyncContent();
                this.setState({loading: false});
            });
        }
        /**
         * Traversoi kalenterin jokaisen sisältösolun, ja tarjoaa niitä sisältökerroksien
         * dekoroitavaksi. Sisältökerros voi tällöin esim. lisätä solun children-taulukkoon
         * omat lisäyksensä.
         *
         * @access private
         */
        applyAsyncContent() {
            this.contentLayers.forEach(layer => {
                this.props.grid.forEach(row => {
                    row.forEach(cell => {
                        (cell instanceof Cell) && layer.decorateCell(cell);
                    });
                });
            });
        }
        /**
         * @access private
         * @param {Cell} cell
         * @returns {VNode}
         */
        newCell(cell) {
            let content;
            if (!cell) {
                content = '';
            } else if (!cell.children || !cell.children.length) {
                content = cell.content;
            } else {
                content = this.newTitledContent(cell);
            }
            return $el('div', {className: 'col'},
                $el('div', {className: 'cell'}, content)
            );
        }
        /**
         * @access private
         * @param {Cell} cell
         * @returns {VNode}
         */
        newTitledContent(cell) {
            return $el('span', null,
                // Title
                cell.content,
                // Sisältö
                cell.children.map(factory =>
                    factory().map(([cmp, props]) => $el(cmp, props))
                )
            );
        }
        render() {
            return $el('div', {className: 'main'}, this.props.grid.map(row =>
                $el('div', {className: 'row'},
                    row.map(cell => this.newCell(cell)
                ))
            ));
        }
    }
    class Cell {
        constructor(content, date) {
            this.date = date;
            this.content = content;
            this.children = [];
        }
    }
    class ImmutableCell {
        constructor(content) {
            this.content = content;
        }
    }
    return {default: Content, Cell, ImmutableCell, HOURS_ARRAY};
});