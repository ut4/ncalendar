import Header from './Header.js';
import Content from './Content.js';
import ComponentConstruct from './ComponentConstruct.js';

/*
 * ViewLayoutien juuriluokka
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
            new ComponentConstruct(Header[this.getName()], {
                dateCursor: this.dateCursor,
                dateUtils: this.dateUtils
            }),
            new ComponentConstruct(Content, {gridGeneratorFn: () => this.generateFullGrid()})
        ];
    }
    /**
     * @access protected
     * @returns {Array}
     */
    getCompactLayout() {
        return [
            null,
            new ComponentConstruct(Content, {gridGeneratorFn: () => this.generateCompactGrid()})
        ];
    }
}

export default AbstractViewLayout;
