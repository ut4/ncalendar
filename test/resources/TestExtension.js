import ComponentConstruct from '../../src/ComponentConstruct.js';

/*
 * Testilaajennos, joka dekoroi kalenterin jokaisen solun komponentilla,
 * johon renderöityy laajennoksen sisällön latauskerrat.
 */
class TestExtension {
    constructor(calendarController) {
        this.args = [...arguments];
        this.calendar = calendarController;
        this.firstCell = null;
        this.loadCount = 0;
        this.loadReturnValue = calendarController.settings.testExtensionLoadReturnValue;
        this.toolbarButtonText = 'Foo';
    }
    setSomeValue(value) {
        this.someValue = value;
    }
    setLoadReturnValue(loadReturnValue) {
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
        return this.calendar.contentController;
    }
    getFirstCell() {
        return this.firstCell;
    }
    decorateCell(cell) {
        cell.children.push(new ComponentConstruct('span', null, this.loadCount));
        if (cell && !this.hasOneClickHandler) {
            cell.clickHandlers.push(TestExtension.testClickHandler);
            this.hasOneClickHandler = true;
            this.firstCell = cell;
        }
    }
    addToolbarPartFactories(register) {
        register.add('abutton', () => $el('button', null, this.toolbarButtonText));
    }
    getToolbarButtonText() {
        return this.toolbarButtonText;
    }
    static defineSettings(register) {
        register.add(
            'testExtensionLoadReturnValue',
            value => value === 'qwerty' ? '%s ei voi olla "qwerty"' : true,
            'foo'
        );
    }
    static testClickHandler() {
        //
    }
}

export default TestExtension;
