define(['src/ComponentConstruct'], (ComponentConstruct) => {
    'use strict';
    const someComponent = props => $el('span', null, props.loadCount);
    /*
     * Testisisältökerros, joka dekoroi kalenterin jokaisen solun komponentilla,
     * johon renderöityy kerroksen latauskerrat.
     */
    class TestContentLayer {
        constructor(contentController, calendarController) {
            this.args = arguments;
            this.contentController = contentController;
            this.calendarController = calendarController;
            this.loadCount = 0;
        }
        load() {
            this.hasOneClickHandler = false;
            this.loadCount++;
            return Promise.resolve('foo');
        }
        setLoadCount(loadCount) {
            this.loadCount = loadCount;
        }
        triggerContentRefresh() {
            this.contentController.refresh();
        }
        decorateCell(cell) {
            cell.children.push(
                new ComponentConstruct.default(someComponent, {loadCount: this.loadCount})
            );
            if (cell && !this.hasOneClickHandler) {
                cell.clickHandlers.push(TestContentLayer.testClickHandler);
                this.hasOneClickHandler = true;
            }
        }
        static testClickHandler() {
            //
        }
    }
    return {default: TestContentLayer};
});