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
         *     changeView: {Function},
         *     titleFormatters: {Object},
         *     contentLayers: {Array}
         * }
         */
        constructor(props) {
            super(props);
            this.state = {
                isMobileViewEnabled: mobileViewCondition.matches,
                viewLayout: this.newViewLayout(this.props)
            };
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
                header !== null && $el(header.Component,
                    header.props
                ),
                $el(content.Component, {
                    grid: content.props.gridGeneratorFn(),
                    selectedContentLayers: this.props.contentLayers,
                    dateCursor: this.props.dateCursor,
                    currentView: this.props.currentView,
                    isMobileViewEnabled: this.state.isMobileViewEnabled
                })
            );
        }
    }
    return {default: Layout};
});
