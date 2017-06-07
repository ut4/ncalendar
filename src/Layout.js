define(['src/Header', 'src/Toolbar', 'src/Content', 'src/Constants'], (Header, Toolbar, Content, Constants) => {
    'use strict';
    const mobileViewCondition = window.matchMedia('(max-width:800px)');
    /*
     * Kasailee kalenterin eri osat paikalleen <Calendar.currentView> -muodossa.
     */
    class Layout extends Inferno.Component {
        /**
         * @param {object} props {
         *     dateCursor: {DateCursor},
         *     currentView: {string},
         *     changeView: {Function}
         * }
         */
        constructor(props) {
            super(props);
            this.state = {
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
            if (this.props.currentView === Constants.VIEW_DAY) {
                return;
            }
            const newIsMobileViewEnabled = newMatch.matches;
            if (newIsMobileViewEnabled !== this.state.isMobileViewEnabled) {
                this.setState({isMobileViewEnabled: newIsMobileViewEnabled});
            }
        }
        /**
         * Renderöi kalenterin kokonaisuudessaan mutaatiossa day, week,
         * week-mobile, month, tai month-mobile.
         */
        render() {
            //
            let className = 'cal ' + this.props.currentView;
            if (this.state.isMobileViewEnabled &&
                this.props.currentView !== Constants.VIEW_DAY) {
                className += '-mobile mobile';
            }
            //
            const isWeekOrMonthMobileView = this.state.isMobileViewEnabled &&
                (this.props.currentView === Constants.VIEW_WEEK ||
                this.props.currentView === Constants.VIEW_MONTH);
            //
            return $el('div', {className},
                $el(Toolbar.default, {
                    dateCursor: this.props.dateCursor,
                    currentView: this.props.currentView,
                    onViewChange: this.props.changeView
                }),
                !isWeekOrMonthMobileView && $el(Header[this.props.currentView], {
                    dateCursor: this.props.dateCursor
                }),
                $el(Content[this.props.currentView], {
                    dateCursor: this.props.dateCursor,
                    isMobileViewEnabled: this.state.isMobileViewEnabled
                })
            );
        }
    }
    return {default: Layout};
});
