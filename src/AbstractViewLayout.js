import Content from './Content.js';
import ComponentConstruct from './ComponentConstruct.js';

/*
 * ViewLayoutien juuriluokka.
 */
class AbstractViewLayout {
    /**
     * @param {DateCursor} dateCursor
     * @param {DateUtils} dateUtils
     */
    constructor(dateCursor, dateUtils) {
        this.dateCursor = dateCursor;
        this.dateUtils = dateUtils;
    }
    /**
     * @access public
     * @param {boolean} compactFormShouldBeUsed
     * @returns {Array}
     */
    getParts(compactFormShouldBeUsed) {
        return !compactFormShouldBeUsed ? this.getFullLayout() : this.getCompactLayout();
    }
    /**
     * @access protected
     * @returns {Array}
     */
    getFullLayout() {
        return [
            new ComponentConstruct(Header, {items: this.getHeaderCells()}),
            new ComponentConstruct(Content, {gridGeneratorFn: () => this.getFullGrid()})
        ];
    }
    /**
     * @access protected
     * @returns {Array}
     */
    getCompactLayout() {
        return [
            null,
            new ComponentConstruct(Content, {gridGeneratorFn: () => this.getCompactGrid()})
        ];
    }
}

/*
 * Kalenterin toolbarin alapuolelle renderöitävä header-rivi.
 *  ___________________________
 * |__________Toolbar__________|
 * |______--> Header <--_______|
 * |                           |
 * |         Content           |
 * |___________________________|
 */
class Header extends React.Component {
    render() {
        return $el('div', {className: 'header'},
            $el('div', {className: 'row'}, this.props.items.map((item, i) =>
                $el('div', {key: i + item, className: 'col'}, $el('div', {className: 'cell'}, item))
            ))
        );
    }
}

export default AbstractViewLayout;
