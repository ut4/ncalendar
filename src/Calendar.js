define(['src/Layout', 'src/Constants', 'src/DateCursors'], (Layout, Constants, DateCursors) => {
    'use strict';
    /*
     * Kalenterin juurikomponentti, ja kirjaston public API.
     */
    class Calendar extends Inferno.Component {
        /**
         * @param {Object} props {initialView: {string=}}
         */
        constructor(props) {
            super(props);
            const initialView = Constants['VIEW_' + ((props.initialView || 'default').toUpperCase())];
            this.state = {
                currentView: initialView,
                dateCursor: this.makeDateCursor(initialView)
            };
        }
        /**
         * Asettaa staten <state.currentView>:in arvoksi <to> (mikäli se ei ole
         * jo valmiiksi), ja alustaa uuden kursorin <state.dateCursor>:iin (mi-
         * käli näkymä vaihtui).
         *
         * @access public
         * @param {string} to Constants.VIEW_DAY | Constants.VIEW_WEEK | Constants.VIEW_MONTH
         */
        changeView(to) {
            const newView = Constants['VIEW_' + to.toUpperCase()];
            if (this.state.currentView === newView) {
                return;
            }
            this.setState({
                currentView: newView,
                dateCursor: this.makeDateCursor(newView)
            });
        }
        /**
         * Luo layoutin.
         *
         * @access private
         */
        render() {
            return $el(Layout.default, {
                dateCursor: this.state.dateCursor,
                currentView: this.state.currentView,
                changeView: this.changeView.bind(this)
            });
        }
        /**
         * @access private
         */
        makeDateCursor(viewName) {
            return DateCursors.dateCursorFactory.newDateCursor(viewName, () => {
                this.setState({dateCursor: this.state.dateCursor});
            });
        }
    }
    return {default: Calendar};
});
