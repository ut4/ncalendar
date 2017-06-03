require(['src/Layout'], Layout => {
    'use strict';
    Inferno.render($el(Layout.default), document.getElementById('cal'));
});
