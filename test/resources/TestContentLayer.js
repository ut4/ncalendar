import ComponentConstruct from '../../src/ComponentConstruct.js';

/*
 * Testisisältökerros, joka dekoroi kalenterin jokaisen solun komponentilla,
 * johon renderöityy kerroksen latauskerrat.
 */
class TestContentLayer {
    constructor(contentController, calendarController, loadReturnValue = 'foo') {
        this.args = [...arguments];
        this.contentController = contentController;
        this.calendarController = calendarController;
        this.firstCell = null;
        this.loadCount = 0;
        this.loadReturnValue = loadReturnValue;
    }
    load() {
        this.hasOneClickHandler = false;
        this.loadCount++;
        return Promise.resolve(this.loadReturnValue);
    }
    setLoadCount(loadCount) {
        this.loadCount = loadCount;
    }
    getContentController() {
        return this.contentController;
    }
    getFirstCell() {
        return this.firstCell;
    }
    decorateCell(cell) {
        cell.children.push(new ComponentConstruct('span', null, this.loadCount));
        if (cell && !this.hasOneClickHandler) {
            cell.clickHandlers.push(TestContentLayer.testClickHandler);
            this.hasOneClickHandler = true;
            this.firstCell = cell;
        }
    }
    static testClickHandler() {
        //
    }
}

export default TestContentLayer;
