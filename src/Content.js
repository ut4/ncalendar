define(['src/Constants', 'src/ioc'], (Constants, ioc) => {
    'use strict';
    const HOURS_ARRAY = Array.from(Array(Constants.HOURS_IN_DAY).keys());
    const LoadType = Object.freeze({
        INITIAL: 'initial',
        NAVIGATION: 'navigation',
        VIEW_CHANGE: 'view-change'
    });
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
    class Content extends React.Component {
        /**
         * @param {object} props {
         *     grid: {Array},
         *     calendarController: {Object},
         *     currentView: {string}
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
                        this.newController(),
                        this.props.calendarController
                    ])
                );
                this.loadAsyncContent(LoadType.INITIAL);
            }
        }
        /**
         * Poistaa props.gridistä sisältökerroksien modifikaatiot (children &
         * clickHandlers).
         */
        resetGrid() {
            return this.props.grid.map(rows => rows.map(cell => {
                if (cell && !(cell instanceof ImmutableCell)) {
                    cell.children = [];
                    cell.clickHandlers = [];
                }
            }));
        }
        /**
         * Triggeröi sisältökerroksien päivityksen, jos niitä on.
         */
        componentWillReceiveProps(props) {
            if (this.hasAsyncContent) {
                this.setState({loading: true});
                this.loadAsyncContent(props.currentView === this.props.currentView
                    ? LoadType.NAVIGATION
                    : LoadType.VIEW_CHANGE
                );
            }
        }
        /**
         * Lataa & ajaa sisältökerrokset, esim. eventLayerin tapahtumat.
         *
         * @access private
         */
        loadAsyncContent(loadType) {
            return Promise.all(this.contentLayers.map(l => l.load(loadType))).then(() => {
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
            this.resetGrid();
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
         * @param {string} key
         * @returns {VNode}
         */
        newCell(cell, key) {
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
                    if (e.which && e.which !== 1) { return; }
                    cell.clickHandlers.forEach(fn => fn(cell, e));
                };
            }
            return $el('div', {className: 'col', key},
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
                cell.children.map((child, i) =>
                    $el(child.Component, Object.assign({}, child.props, {key: i}))
                )
            );
        }
        /**
         * Public API-versio tästä luokasta sisältökerroksia varten.
         */
        newController() {
            return {
                LoadType,
                Cell,
                PlaceholderCell,
                refresh: () => {
                    this.applyAsyncContent();
                    this.forceUpdate();
                }
            };
        }
        render() {
            return $el('div', {className: 'main'}, this.props.grid.map((row, ri) =>
                $el('div', {className: 'row', key: ri},
                    row.map((cell, ci) => this.newCell(cell, ri+'.'+ci)
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
    return {default: Content, Cell, ImmutableCell, PlaceholderCell, LoadType, HOURS_ARRAY};
});