// 1. window.React && window.ReactDOM
if (window.Inferno) {
    window.React = Inferno;
    window.React.ON_INPUT = 'onInput';
    window.ReactDOM = Inferno;
} else if (window.preact) {
    window.React = preact;
    window.React.ON_INPUT = 'onInput';
    window.ReactDOM = {render: (component, containerNode, replaceNode) =>
        preact.render(component, containerNode, replaceNode)._component
    };
} else if (window.React) {
    window.React.ON_INPUT = 'onChange';
} else {
    throw new Error('nullcalendar tarvitsee Inferno, preact, tai React\'n toimiakseen');
}
// 2. window.$el
window.$el = React.createElement;
