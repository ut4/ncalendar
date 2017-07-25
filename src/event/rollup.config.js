import config from '../../rollup.config.js';

export default Object.assign({}, config, {
    entry: '../../main.js',
    dest: '../../dist/nullcalendar+events.js',
    banner: config.banner.replace('* nullcalendar', '* nullcalendar+events')
});
