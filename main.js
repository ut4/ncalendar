require(['src/Calendar'], (Calendar) => {
    'use strict';
    Inferno.render($el(Calendar.default), document.getElementById('cal'));
});
