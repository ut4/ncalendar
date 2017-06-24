define(['src/Toolbar', 'src/Constants', 'src/ViewLayouts'], (Toolbar, Constants, ViewLayouts) => {
    'use strict';
    const smallScreenCondition = window.matchMedia('(max-width:800px)');
    /*
     * Kasailee kalenterin eri osat paikalleen {props.currentView} -muodossa.
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
                smallScreenConditionMaches: smallScreenCondition.matches,
                viewLayout: this.newViewLayout(this.props)
            };
        }
        /**
         * Lisää matchmedia-kuuntelijan.
         */
        componentWillMount() {
            smallScreenCondition.addListener(this.viewPortListener.bind(this));
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
         * Matchmedia-kuuntelija. Päivittää state.smallScreenConditionMaches:n
         * arvoksi true, mikäli selaimen ikkuna on pienempi kuin {?}, tai false,
         * jos se on suurempi kuin {?}.
         *
         * @access private
         * @param {MediaQueryList} newMatch
         */
        viewPortListener(newMatch) {
            const newSmallScreenConditionMaches = newMatch.matches;
            if (newSmallScreenConditionMaches !== this.state.smallScreenConditionMaches) {
                this.setState({smallScreenConditionMaches: newSmallScreenConditionMaches});
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
         * week-compact, month, tai month-compact.
         */
        render() {
            //
            let className = 'cal ' + this.props.currentView;
            if (this.state.smallScreenConditionMaches &&
                this.props.currentView !== Constants.VIEW_DAY) {
                className += '-compact compact';
            }
            //
            const [header, content] = this.state.viewLayout.getParts(
                this.state.smallScreenConditionMaches
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
                    isCompactViewEnabled: this.state.smallScreenConditionMaches
                })
            );
        }
    }
    return {default: Layout};
});
