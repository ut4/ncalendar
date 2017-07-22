if (window.Inferno) {
    window.React.INPUT_EVENT = 'input';
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
    window.ReactTestUtils.Simulate = {click: el => el.click(), input: el => triggerEvent('input', el)};
} else if (window.React) {
    window.React.INPUT_EVENT = 'change';
    window.ReactTestUtils = React.addons.TestUtils;
} else {
    throw new Error('Testusetup tarvitsee toimiakseen React+React.addons.TestUtils tai Inferno+Inferno.TestUtils');
}
function triggerEvent(eventType, el) {
    const event = document.createEvent('HTMLEvents');
    event.initEvent(eventType, false, true);
    el.dispatchEvent(event);
}
