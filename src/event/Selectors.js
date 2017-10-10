/* interface Selector {
    // Vastaanottaa kalenterilta uudet eventit {events}.
    public setSelectables(events);
}*/

class DropdownSelector extends React.Component {
    /**
     * @param {Object} props {
     *     eventExtension: {EventExtension}
     * }
     */
    constructor(props) {
        super(props);
        this.categoryMap = {};
        this.state = {categories: []};
    }
    /**
     * @access public
     * @param {EventCollection} events
     */
    setSelectables(events) {
        this.setState({categories: this.makeCategories(events)});
    }
    /**
     * @access public
     */
    render() {
        return $el('span', null, $el('select', {onChange: e => this.receiveCategory(e.target.value)},
            ['-'].concat(this.state.categories).map((catName, i) =>
                $el('option', {value: catName, key: i}, catName)
            )
        ));
    }
    /**
     * @access private
     * @param {EventCollection} events
     * @returns {string[]}
     */
    makeCategories(events) {
        events.forEach(event => {
            if (!this.categoryMap.hasOwnProperty(event.category)) {
                this.categoryMap[event.category] = 1;
            }
        });
        return Object.keys(this.categoryMap);
    }
    /**
     * @access private
     * @param {string} catName
     */
    receiveCategory(catName) {
        this.props.eventExtension.applyFilter(catName !== '-' ? event => event.category === catName : null);
    }
}

class CheckboxSelector extends React.Component {
    constructor(props) {
        super(props);
        this.selectedTags = ['cat1', 'cat2', 'cat3'];
    }
    setSelectables(events) {
        //
    }
    render() {
        return $el('span', null, 'TODO');
    }
}

export { DropdownSelector, CheckboxSelector };
