import Constants from './Constants.js';
import ContentLayerFactory from './ContentLayerFactory.js';

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
        const selectedContentLayers = this.props.calendarController.settings.contentLayers;
        this.hasAsyncContent = selectedContentLayers.length > 0;
        this.state = {currentlyHasAsyncContent: undefined};
        if (this.hasAsyncContent) {
            this.controller = this.newController();
            const contentLayerFactory = new ContentLayerFactory();
            this.contentLayers = selectedContentLayers.map(layerConfig => {
                const instance = contentLayerFactory.make(layerConfig, [
                    this.controller,
                    this.props.calendarController
                ]);
                instance.configuredName = layerConfig.name || layerConfig;
                return instance;
            });
            this.loadAsyncContent(LoadType.INITIAL);
        }
    }
    /**
     * Triggeröi sisältökerroksien päivityksen, jos niitä on.
     */
    componentWillReceiveProps(props) {
        if (this.hasAsyncContent) {
            this.setState({currentlyHasAsyncContent: undefined});
            this.loadAsyncContent(props.currentView === this.props.currentView
                ? LoadType.NAVIGATION
                : LoadType.VIEW_CHANGE
            );
        }
    }
    /**
     * Disabloi sisältökerroksien lataustapahtuman jälkeisen renderöinnin, jos
     * yksikään ladatuista kerroksista ei palauttanut sisältöä.
     */
    shouldComponentUpdate(_, state) {
        return state.currentlyHasAsyncContent !== false;
    }
    /**
     * Palauttaa sisältö-API:n, jonka kautta pääsee käsiksi mm. sisältökerroksien
     * omiin apeihin. Jos valittuja sisältökerroksia ei ole, palauttaa undefined.
     */
    getController() {
        return this.controller;
    }
    /**
     * Palauttaa instantoidun sisältökerroksen {name}, tai undefined, jos sellaista
     * ei löytynyt.
     *
     * @param {string} name
     * @returns {Object} instanssi sisältökerroksesta
     */
    getLayer(name) {
        return this.contentLayers.find(layerInstance =>
            layerInstance.configuredName === name
        );
    }
    /**
     * Poistaa props.gridistä sisältökerroksien modifikaatiot (children &
     * clickHandlers).
     *
     * @access private
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
     * Lataa & ajaa sisältökerrokset, esim. eventLayerin tapahtumat.
     *
     * @access private
     */
    loadAsyncContent(loadType) {
        return Promise.all(
            this.contentLayers.map(layer => layer.load(loadType))
        ).then(returnValues => {
            const layersWhichMaybeHadContent = this.contentLayers.filter((layer, i) =>
                // Layerit, joiden load palautti false, skipataan. Jos layer
                // ei palauttanut mitään, tai jotain muuta kuin false, ladataan
                // normaalisti.
                returnValues[i] !== false
            );
            if (layersWhichMaybeHadContent.length > 0) {
                this.applyAsyncContent(layersWhichMaybeHadContent);
                this.setState({currentlyHasAsyncContent: true});
            }
        });
    }
    /**
     * Traversoi kalenterin jokaisen sisältösolun, ja tarjoaa ne sisältökerroksien
     * dekoroitavaksi. Sisältökerros voi tällöin esim. lisätä solun children-,
     * tai clickHandlers-taulukkoon omat lisäyksensä.
     *
     * @access private
     */
    applyAsyncContent(layersToLoad) {
        this.resetGrid();
        (layersToLoad || this.contentLayers).forEach(layer => {
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
            content = null;
        } else if (!cell.children || !cell.children.length) {
            content = cell.content;
        } else {
            content = this.nestedContent(cell);
        }
        const attrs = {className: 'cell'};
        if (cell && cell.clickHandlers && cell.clickHandlers.length) {
            attrs.onClick = e => {
                if (e.which && e.which !== 1) { return; }
                cell.clickHandlers.forEach(fn => fn(cell, e));
            };
        }
        return $el('div', {className: 'col' + (cell && cell.isCurrentDay ? ' current' : ''), key},
            $el('div', attrs, $el('div', null, content))
        );
    }
    /**
     * @access private
     * @param {Cell} cell
     * @returns {VNode|VNode[]}
     */
    nestedContent(cell) {
        const children = cell.children.map((child, i) =>
            $el(child.Component, Object.assign({}, child.props, {key: i}), child.content)
        );
        return cell.content
            ? [$el('span', null, cell.content)].concat(children)
            // Luultavasti viikko-gridin cell, joissa ei sisältöä
            : children;
    }
    /**
     * Public API-versio tästä luokasta sisältökerroksia varten.
     *
     * @access private
     */
    newController() {
        return {
            LoadType,
            Cell,
            PlaceholderCell,
            refresh: () => {
                this.applyAsyncContent();
                this.forceUpdate();
            },
            reRender: () => {
                this.forceUpdate();
            },
            getLayer: name => this.getLayer(name),
            getRenderedGrid: () => this.mainEl
        };
    }
    render() {
        return $el('div', {className: 'main', ref: el => { this.mainEl = el; }},
            this.props.grid.map((row, rowIndex) =>
                $el('div', {className: 'row', key: rowIndex},
                    row.map((cell, colIndex) => this.newCell(cell, rowIndex + '.' + colIndex)
                ))
            )
        );
    }
}
class Cell {
    constructor(content, date, isCurrentDay) {
        this.content = content;
        this.date = date;
        this.isCurrentDay = isCurrentDay;
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

export default Content;
export {Cell, ImmutableCell, PlaceholderCell, LoadType, HOURS_ARRAY};
