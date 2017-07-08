// 1. window.React && window.ReactDOM
if (!window.React) {
    if (window.Inferno) {
        window.React = Inferno;
        window.ReactDOM = Inferno;
        window.$el = Inferno.createElement;
    } else if (window.preact) {
        window.React = preact;
        window.ReactDOM = {render: (component, containerNode, replaceNode) =>
            preact.render(component, containerNode, replaceNode)._component
        };
        window.$el = preact.h;
    } else {
        throw new Error('nullcalendar tarvitsee Inferno, preact, tai React\'n toimiakseen');
    }
}
// 2. window.$el
window.$el = React.createElement;
