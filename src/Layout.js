define(['src/Calendar', 'src/Header', 'src/Toolbar', 'src/Content'], (Calendar, Header, Toolbar, Content) => {
    'use strict';
    const mobileViewCondition = window.matchMedia('(max-width:800px)');
    /*
     * Kalenterin juurikomponentti.
     */
    class Layout extends Inferno.Component {
        /**
         * @param {object} props {currentView: {string=}}
         */
        constructor(props) {
            super(props);
            this.state = {
                currentView: Calendar.views[props.currentView ? props.currentView.toUpperCase() : 'DEFAULT'],
                isMobileViewEnabled: mobileViewCondition.matches
            };
        }
        /**
         * Lisää matchmedia-kuuntelijan.
         */
        componentWillMount() {
            mobileViewCondition.addListener(this.viewPortListener.bind(this));
        }
        /**
         * Matchmedia-kuuntelija. Päivittää state.isMobileViewEnabled:n arvoksi
         * true, mikäli selaimen ikkuna on pienempi kuin <n>, tai false, jos se
         * on suurempi kuin <n>.
         *
         * @access private
         * @param {MediaQueryList} newMatch
         */
        viewPortListener(newMatch) {
            // Päivänäkymällä ei ole erillistä mobile™-mutaatiota
            if (Calendar.state.currentView === Calendar.views.DAY) {
                return;
            }
            const newIsMobileViewEnabled = newMatch.matches;
            if (newIsMobileViewEnabled !== this.state.isMobileViewEnabled) {
                this.setState({isMobileViewEnabled: newIsMobileViewEnabled});
            }
        }
        /**
         * Asettaa staten <state.currentView>:in arvoksi <to> (mikäli se ei ole
         * jo valmiiksi).
         *
         * @access public
         * @param {string} to keyof Calendar.views
         */
        changeView(to) {
            const newView = Calendar.views[to.toUpperCase()];
            if (this.state.currentView === newView) {
                return;
            }
            this.setState({currentView: newView});
        }
        /**
         * Renderöi kalenterin kokonaisuudessaan mutaatiossa day, week,
         * week-mobile, month, tai month-mobile.
         */
        render() {
            //
            let className = 'cal ' + this.state.currentView;
            if (this.state.isMobileViewEnabled &&
                this.state.currentView !== Calendar.views.DAY) {
                className += '-mobile mobile';
            }
            //
            const isWeekOrMonthMobileView = this.state.isMobileViewEnabled &&
                (this.state.currentView === Calendar.views.WEEK ||
                this.state.currentView === Calendar.views.MONTH);
            //
            return $el('div', {className},
                $el(Toolbar.default, {currentView: this.state.currentView, onViewChange: this.changeView.bind(this)}),
                !isWeekOrMonthMobileView && $el(Header[this.state.currentView]),
                $el(Content[this.state.currentView], {isMobileViewEnabled: this.state.isMobileViewEnabled})
            );
        }
    }
    return {default: Layout};
});
