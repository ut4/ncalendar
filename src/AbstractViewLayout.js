define(['src/Header', 'src/Content', 'src/ComponentConstruct', 'src/ioc'], (Header, Content, ComponentConstruct, ioc) => {
    'use strict';
    /*
     * ViewLayoutien juuriluokka
     */
    class AbstractViewLayout {
        /**
         * @param {DateCursor} dateCursor
         */
        constructor(dateCursor) {
            this.dateCursor = dateCursor;
            this.dateUtils = ioc.default.dateUtils();
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
                new ComponentConstruct.default(Header[this.getName()], {dateCursor: this.dateCursor}),
                new ComponentConstruct.default(Content.default, {gridGeneratorFn: () => this.generateFullGrid()})
            ];
        }
        /**
         * @access protected
         * @returns {Array}
         */
        getCompactLayout() {
            return [
                null,
                new ComponentConstruct.default(Content.default, {gridGeneratorFn: () => this.generateCompactGrid()})
            ];
        }
    }
    return {default: AbstractViewLayout};
});