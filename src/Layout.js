define(['src/Calendar', 'src/Header', 'src/Toolbar', 'src/Content'], (Calendar, Header, Toolbar, Content) => {
    'use strict';
    /*
     * Kalenterin juurikomponentti.
     */
    class Layout extends Inferno.Component {
        /**
         * @param {object} props {currentView: viewName: string}
         */
        constructor(props) {
            super(props);
            this.state = {currentView: Calendar.views.DEFAULT};
        }
        /**
         * Asettaa staten <state.currentView>:in arvoksi <to> (mikäli se ei ole
         * jo valmiiksi).
         *
         * @param {string} to keyof Calendar.views
         */
        onViewChange(to) {
            const newView = Calendar.views[to.toUpperCase()];
            if (this.state.currentView === newView) {
                return;
            }
            this.setState({currentView: newView});
        }
        /**
         * Renderöi kalenterin kokonaisuudessaan.
         */
        render() {
            return $el('div', {className: 'cal ' + this.state.currentView},
                $el(Toolbar.default, {currentView: this.state.currentView, onViewChange: this.onViewChange.bind(this)}),
                $el(Header[this.state.currentView]),
                $el(Content[this.state.currentView])
            );
        }
    }
    return {default: Layout};
});
