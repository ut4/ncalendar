define(['src/Header', 'src/Content'], (Header, Content) => {
    'use strict';
    /**
     * ViewLayoutien juuriluokka
     */
    class AbstractViewLayout {
        /**
         * @param {DateCursor} dateCursor
         */
        constructor(dateCursor) {
            this.dateCursor = dateCursor;
        }
        /**
         * @access public
         * @param {boolean} useCompactForm
         * @returns {Layout}
         */
        getParts(useCompactForm) {
            return !useCompactForm ? this.getFullLayout() : this.getCompactLayout();
        }
        /**
         * @access protected
         * @returns {Array}
         */
        getFullLayout() {
            return [
                new LayoutPart(Header[this.getName()], {dateCursor: this.dateCursor}),
                new LayoutPart(Content.default, {gridGeneratorFn: () => this.generateFullGrid()})
            ];
        }
        /**
         * @access protected
         * @returns {Array}
         */
        getCompactLayout() {
            return [
                null,
                new LayoutPart(Content.default, {gridGeneratorFn: () => this.generateCompactGrid()})
            ];
        }
    }
    class LayoutPart {
        constructor(Component, props) {
            this.Component = Component;
            this.props = props || {};
        }
    }
    return {default: AbstractViewLayout};
});