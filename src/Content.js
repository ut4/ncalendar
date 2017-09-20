import Constants from './Constants.js';
import ExtensionFactory from './ExtensionFactory.js';

const HOURS_ARRAY = Array.from(Array(Constants.HOURS_IN_DAY).keys());
const LoadType = Object.freeze({
    INITIAL: 'initial',
    NAVIGATION: 'navigation',
    VIEW_CHANGE: 'view-change'
});

/*
 * Kalenterin pääsisältö, renderöi ViewLayoutin generoiman gridin, ja lisää
 * valittujen laajennoksien (jos niitä on) luoman sisällön gridin soluihin.
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
        const selectedExtensions = this.props.calendarController.settings.extensions;
        this.hasAsyncContent = selectedExtensions.length > 0;
        this.state = {currentlyHasAsyncContent: undefined};
        if (this.hasAsyncContent) {
            this.controller = this.newController();
            const extensionFactory = new ExtensionFactory();
            this.extensions = selectedExtensions.map(extensionConfig => {
                const instance = extensionFactory.make(extensionConfig, [
                    this.controller,
                    this.props.calendarController
                ]);
                instance.configuredName = extensionConfig.name || extensionConfig;
                return instance;
            });
            this.loadAsyncContent(LoadType.INITIAL);
        }
    }
    /**
     * Triggeröi laajennoksien päivityksen, jos niitä on.
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
     * Disabloi laajennoksien lataustapahtuman jälkeisen renderöinnin, jos
     * yksikään ladatuista laajennoksista ei palauttanut sisältöä.
     */
    shouldComponentUpdate(_, state) {
        return state.currentlyHasAsyncContent !== false;
    }
    /**
     * Palauttaa sisältö-API:n, jonka kautta pääsee käsiksi mm. laajennoksien
     * omiin apeihin. Jos valittuja laajennoksia ei ole, palauttaa undefined.
     */
    getController() {
        return this.controller;
    }
    /**
     * Palauttaa instantoidun laajennoksen {name}, tai undefined, jos sellaista
     * ei löytynyt.
     *
     * @param {string} name
     * @returns {Object} laajennosinstanssi
     */
    getExtension(name) {
        return this.extensions.find(extensionInstance =>
            extensionInstance.configuredName === name
        );
    }
    /**
     * Poistaa props.gridistä laajennoksien modifikaatiot (children &
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
     * Lataa & ajaa laajennokset, esim. eventExtensionin tapahtumat.
     *
     * @access private
     */
    loadAsyncContent(loadType) {
        return Promise.all(
            this.extensions.map(extension => extension.load(loadType))
        ).then(returnValues => {
            const extensionsWhichMaybeHadContent = this.extensions.filter((extension, i) =>
                // Extensionit, joiden load palautti false, skipataan. Jos extension
                // ei palauttanut mitään, tai jotain muuta kuin false, ladataan
                // normaalisti.
                returnValues[i] !== false
            );
            if (extensionsWhichMaybeHadContent.length > 0) {
                this.applyAsyncContent(extensionsWhichMaybeHadContent);
                this.setState({currentlyHasAsyncContent: true});
            }
        });
    }
    /**
     * Traversoi kalenterin jokaisen sisältösolun, ja tarjoaa ne laajennoksien
     * dekoroitavaksi. Laajennos voi tällöin esim. lisätä solun children-,
     * tai clickHandlers-taulukkoon omat lisäyksensä.
     *
     * @access private
     */
    applyAsyncContent(extensionsToLoad) {
        this.resetGrid();
        (extensionsToLoad || this.extensions).forEach(extension => {
            this.props.grid.forEach(row => {
                row.forEach(cell => {
                    (cell instanceof Cell) && extension.decorateCell(cell);
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
     * Public API-versio tästä luokasta laajennoksia varten.
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
            getExtension: name => this.getExtension(name),
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
