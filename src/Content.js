define(['src/Constants'], (Constants) => {
    'use strict';
    const HOURS_ARRAY = Array.from(Array(Constants.HOURS_IN_DAY).keys());
    /*
     * Kalenterin pääsisältö, renderöi ViewLayoutin generoiman gridin.
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
         *     contentLayers: {Array}
         * }
         */
        constructor(props) {
            super(props);
            this.props.contentLayers && this.props.contentLayers.forEach(layer => {
                this.props.grid.forEach(row => {
                    row.forEach(cell => {
                        cell instanceof Cell && layer.decorateCell(cell);
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