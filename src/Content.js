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
         *     calendarController: {Object}
         * }
         */
        constructor(props) {
            super(props);
            this.state = {};
            const selectedLayers = this.props.calendarController.settings.contentLayers;
            this.hasAsyncContent = selectedLayers.length > 0;
            if (this.hasAsyncContent) {
                const contentLayerFactory = ioc.default.contentLayerFactory();
                this.contentLayers = selectedLayers.map(name =>
                    contentLayerFactory.make(name, [
                        {update: () => this.forceUpdate()},
                        this.props.calendarController
                    ])
                );
                this.loadAsyncContent();
            }
        }
        /**
         * Triggeröi sisältökerroksien päivityksen, jos niitä on.
         */
        componentWillReceiveProps() {
            if (this.hasAsyncContent) {
                this.setState({loading: true});
                this.loadAsyncContent();
            }
        }
        /**
         * Lataa & ajaa sisältökerrokset, esim. eventLayerin tapahtumat.
         *
         * @access private
         */
        loadAsyncContent() {
            return Promise.all(this.contentLayers.map(l => l.load())).then(() => {
                this.applyAsyncContent();
                this.setState({loading: false});
            });
        }
        /**
         * Traversoi kalenterin jokaisen sisältösolun, ja tarjoaa ne sisältökerroksien
         * dekoroitavaksi. Sisältökerros voi tällöin esim. lisätä solun children-,
         * tai clickHandlers-taulukkoon omat lisäyksensä.
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
            const cellAttrs = {className: 'cell'};
            if (cell && cell.clickHandlers && cell.clickHandlers.length) {
                cellAttrs.onClick = e => {
                    cell.clickHandlers.forEach(fn => fn(cell, e));
                };
            }
            return $el('div', {className: 'col'},
                $el('div', cellAttrs, content)
            );
        }
        /**
         * @access private
         * @param {Cell} cell
         * @returns {VNode}
         */
        newTitledContent(cell) {
            return $el('div', null,
                // Title
                cell.content,
                // Sisältö
                cell.children.map(child => Array.isArray(child)
                    ? child.map(construct => $el(construct.Component, construct.props))
                    : $el(child.Component, child.props)
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
            this.clickHandlers = [];
        }
    }
    class PlaceholderCell extends Cell {}
    class ImmutableCell {
        constructor(content) {
            this.content = content;
        }
    }
    return {default: Content, Cell, ImmutableCell, PlaceholderCell, HOURS_ARRAY};
});