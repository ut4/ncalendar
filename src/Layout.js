define(['src/Toolbar', 'src/Constants', 'src/ViewLayouts'], (Toolbar, Constants, ViewLayouts) => {
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
         *     titleFormatters: {Object}
         *     changeView: {Function}
         * }
         */
        constructor(props) {
            super(props);
            const state = {
                isMobileViewEnabled: mobileViewCondition.matches,
                viewLayout: this.newViewLayout(this.props)
            };
            if ('TODO' === true) {
                state.loading = true;
                this.updateContentLayers(this.props);
            }
            this.state = state;
        }
        /**
         * Lisää matchmedia-kuuntelijan.
         */
        componentWillMount() {
            mobileViewCondition.addListener(this.viewPortListener.bind(this));
        }
        /**
         * Refreshaa layotin (jos tarvetta), ja sisältökerrokset (jos tarvetta).
         */
        componentWillReceiveProps(props) {
            if (props.currentView !== this.props.currentView) {
                this.setState({viewLayout: this.newViewLayout(props)});
            }
            if ('TODO' === true) {
                this.setState({loading: true});
                this.updateContentLayers(props);
            }
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
            const newIsMobileViewEnabled = newMatch.matches;
            if (newIsMobileViewEnabled !== this.state.isMobileViewEnabled) {
                this.setState({isMobileViewEnabled: newIsMobileViewEnabled});
            }
        }
        /**
         * Refreshaa sisältökerrokset (esim. eventLayerin tapahtumat).
         *
         * @access private
         */
        updateContentLayers(props) {
            this.contentLayers = [];
            Promise.all(this.contentLayers.map(l => l.load())).then(() => {
                this.setState({loading: false});
            });
        }
        /**
         * @access private
         * @return {Day|Week|MonthViewLayout}
         */
        newViewLayout(props) {
            return new ViewLayouts[props.currentView](props.dateCursor);
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
            const [header, content] = this.state.viewLayout.getParts(
                this.state.isMobileViewEnabled
            );
            return $el('div', {className},
                $el(Toolbar.default, {
                    dateCursor: this.props.dateCursor,
                    currentView: this.props.currentView,
                    onViewChange: this.props.changeView,
                    titleFormatter: this.props.titleFormatters[this.props.currentView] || null
                }),
                header !== null && $el(header.Component, header.props),
                $el(content.Component, content.props)
            );
        }
    }
    return {default: Layout};
});
