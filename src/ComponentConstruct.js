define(() => {
    'use strict';
    class ComponentConstruct {
        constructor(Component, props) {
            this.Component = Component;
            this.props = props;
        }
    }
    return {default: ComponentConstruct};
});