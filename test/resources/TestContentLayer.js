define(() => {
    'use strict';
    const someComponent = props => $el('span', null, props.loadCount);
    /*
     * Testisisältökerros, joka dekoroi kalenterin jokaisen solun komponentilla,
     * johon renderöityy kerroksen latauskerrat.
     */
    class TestContentLayer {
        constructor(dateCursor, currentView, isMobileViewEnabled) {
            this.dateCursor = dateCursor;
            this.currentView = currentView;
            this.isMobileViewEnabled = isMobileViewEnabled;
            TestContentLayer.loadCount = 0;
        }
        load() {
            TestContentLayer.loadCount++;
            return Promise.resolve('foo');
        }
        decorateCell(cell) {
            cell.children.push(() => [
                [someComponent, {loadCount: TestContentLayer.loadCount}]
            ]);
        }
    }
    TestContentLayer.loadCount = 0;
    return {default: TestContentLayer};
});