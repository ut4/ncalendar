(function () {
    'use strict';
    if (window.Inferno) {
        window.ReactTestUtils = Inferno.TestUtils;
        window.ReactTestUtils.findRenderedComponentWithType = (tree, type) => {
            const results = Inferno.TestUtils.findRenderedVNodeWithType(tree, type);
            return results && results.children;
        };
        window.ReactTestUtils.scryRenderedComponentsWithType = Inferno.TestUtils.scryRenderedVNodesWithType;
        window.ReactTestUtils.scryRenderedDOMComponentsWithClass = Inferno.TestUtils.scryRenderedDOMElementsWithClass;
        window.ReactTestUtils.findRenderedDOMComponentWithClass = Inferno.TestUtils.findRenderedDOMElementWithClass;
        window.ReactTestUtils.scryRenderedDOMComponentsWithTag = Inferno.TestUtils.scryRenderedDOMElementsWithTag;
        window.ReactTestUtils.findRenderedDOMComponentWithTag = Inferno.TestUtils.findRenderedDOMElementWithTag;
        window.ReactTestUtils.Simulate = {click: el => el.click()};
    } else if (window.React) {
        window.ReactTestUtils = React.addons.TestUtils;
    } else {
        throw new Error('Testusetup tarvitsee toimiakseen React+React.addons.TestUtils tai Inferno+Inferno.TestUtils');
    }
}());