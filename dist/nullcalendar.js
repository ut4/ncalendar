/**
 * @license nullcalendar
 * Released under BSD-3-Clause license.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define([], factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.nullcalendar = factory();
    }
}(this, function () {
    //almond, and your modules will be inlined here
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

// 1. window.React && window.ReactDOM
if (window.Inferno) {
    window.React = Inferno;
    window.React.ON_INPUT = 'onInput';
    window.ReactDOM = Inferno;
} else if (window.preact) {
    window.React = preact;
    window.React.ON_INPUT = 'onInput';
    window.ReactDOM = {render: (component, containerNode, replaceNode) =>
        preact.render(component, containerNode, replaceNode)._component
    };
} else if (window.React) {
    window.React.ON_INPUT = 'onChange';
} else {
    throw new Error('nullcalendar tarvitsee Inferno, preact, tai React\'n toimiakseen');
}
// 2. window.$el
window.$el = React.createElement;

define('src/Modal',[],() => {
    'use strict';
    /**
     * Kalenterikontrolleri/API:n kautta avattava/suljettava näkymä, johon voidaan
     * ladata custom-sisältöä.
     */
    class Modal extends React.Component {
        constructor(props) {
            super(props);
            this.state = {contentConstruct: null};
        }
        /**
         * @access public
         * @param {ComponentConstruct} construct
         */
        open(construct) {
            this.setState({contentConstruct: construct});
        }
        /**
         * @access public
         */
        close() {
            this.setState({contentConstruct: null});
        }
        /**
         * Renderöi modalin, tai ei tee mitään jos sisältöa ei ole asetettu.
         */
        render() {
            return this.state.contentConstruct
                ? $el('div', {className: 'modal'},
                    $el('div', {className: 'modal-content'},
                        $el(
                            this.state.contentConstruct.Component,
                            Object.assign({}, this.state.contentConstruct.props, {
                                closeModal: () => this.close()
                            })
                        )
                    )
                )
                : null;
        }
    }
    return {default: Modal};
});
define('src/Constants',[],() => {
    'use strict';
    return Object.freeze({
        VIEW_DAY: 'day',
        VIEW_WEEK: 'week',
        VIEW_MONTH: 'month',
        VIEW_DEFAULT: 'week',

        HOURS_IN_DAY: 24,
        DAYS_IN_WEEK: 7
    });
});
define('src/Toolbar',['src/Constants'], Constants => {
    'use strict';
    const titleFormatters = {
        [Constants.VIEW_DAY]: dateCursorRange => {
            return '%1, %2'
                .replace('%1', Intl.DateTimeFormat('fi', {day: 'numeric', month: 'long'}).format(dateCursorRange.start))
                .replace('%2', dateCursorRange.start.getFullYear());
        },
        [Constants.VIEW_WEEK]: dateCursorRange => {
            return '%1 %2 - %3 %4'
                .replace('%1', Intl.DateTimeFormat('fi', {month: 'short'}).format(dateCursorRange.start))
                .replace('%2', dateCursorRange.start.getDate())
                .replace('%3', dateCursorRange.end.getDate())
                .replace('%4', dateCursorRange.start.getFullYear());
        },
        [Constants.VIEW_MONTH]: dateCursorRange => {
            return Intl.DateTimeFormat('fi', {month: 'long', year: 'numeric'}).format(dateCursorRange.start);
        }
    };
    /*
     * Kalenterilayoutin ylin osa. Sisältää päänavigaatiopainikkeet, otsakkeen,
     * ja näkymänavigaatiopainikkeet.
     *  ___________________________
     * |______--> Toolbar <--______|
     * |__________Header___________|
     * |                           |
     * |         Content           |
     * |___________________________|
     */
    class Toolbar extends React.Component {
        /**
         * @param {object} props {
         *     calendarController: {Object},
         *     titleFormatter: {Function=}
         * }
         */
        constructor(props) {
            super(props);
        }
        render() {
            const ctrl = this.props.calendarController;
            return $el('div', {className: 'toolbar'},
                $el('div', {className: 'row'},
                    $el('div', {className: 'col'},
                        $el('button', {onClick: () => ctrl.dateCursor.prev() }, '<'),
                        $el('button', {onClick: () => ctrl.dateCursor.next() }, '>'),
                        $el('button', {onClick: () => ctrl.dateCursor.reset() }, 'Tänään')
                    ),
                    $el('div', {className: 'col'},
                        $el('h2', null, (this.props.titleFormatter || titleFormatters[ctrl.currentView])(ctrl.dateCursor.range))
                    ),
                    $el('div', {className: 'col'},
                        $el('button', {onClick: () => { ctrl.changeView(Constants.VIEW_MONTH); }}, 'Kuukausi'),
                        $el('button', {onClick: () => { ctrl.changeView(Constants.VIEW_WEEK); }}, 'Viikko'),
                        $el('button', {onClick: () => { ctrl.changeView(Constants.VIEW_DAY); }}, 'Päivä')
                    )
                )
            );
        }
    }
    return {default: Toolbar, titleFormatters};
});

define('src/ContentLayerFactory',[],() => {
    'use strict';
    class ContentLayerFactory {
        constructor() {
            this.registrar = {};
        }
        /**
         * Rekisteröi sisältökerros-luokan {clazz} nimellä {name}, tai heittää
         * errorin jos {name} on jo rekisteröity.
         *
         * @access public
         * @param {string} name
         * @param {Function} clazz
         */
        register(name, clazz) {
            if (this.isRegistered(name)) {
                throw new Error(`Layer "${name}" on jo rekisteröity.`);
            }
            this.registrar[name] = clazz;
        }
        /**
         * Palauttaa tiedon löytyykö rekisteristä sisältökerros nimeltä {name}.
         *
         * @access public
         * @param {string} name
         * @returns {boolean}
         */
        isRegistered(name) {
            return this.registrar.hasOwnProperty(name);
        }
        /**
         * Palauttaa uuden instanssin sisältökerros-luokasta argumenteilla {...args},
         * joka löytyy rekisteristä nimellä {name}, tai heittää errorin mikäli
         * luokkaa ei ole rekisteröity.
         *
         * @access public
         * @param {string} name
         * @param {Array} args
         * @return {Object} Uusi instanssi sisältölayerista {name}
         */
        make(name, args) {
            if (!this.isRegistered(name)) {
                throw new Error(`Layeria "${name}" ei ole rekisteröity.`);
            }
            return new this.registrar[name](...args);
        }
    }
    return {default: ContentLayerFactory};
});
define('src/DateUtils',[],() => {
    'use strict';
    const EMPTY_WEEK = Array.from(Array(7));
    class DateUtils {
        getEstimatedFirstDayOfWeek() {
            // Kesäkuun ensimmäinen maanantai, 2017, klo 12:00:00
            return (new Date(2017, 5, 5, 12, 0, 0, 0)).getDay();
        }
        getStartOfWeek(date) {
            const firstDay = this.getEstimatedFirstDayOfWeek();
            const d = new Date(date);
            d.setDate(date.getDate() - (7 + date.getDay() - firstDay) % 7);
            return d;
        }
        getFormattedWeekDays(date, format) {
            const d = this.getStartOfWeek(date);
            return EMPTY_WEEK.map(() => {
                const formatted = format.format(d);
                d.setDate(d.getDate() + 1);
                return formatted;
            });
        }
        getStartOfDay(date) {
            const start = new Date(date);
            start.setHours(0);
            start.setMinutes(0);
            start.setSeconds(0);
            start.setMilliseconds(1);
            return start;
        }
        getEndOfDay(date) {
            const end = new Date(date);
            end.setHours(23);
            end.setMinutes(59);
            end.setSeconds(59);
            end.setMilliseconds(999);
            return end;
        }
        formatHour(hour) {
            return (hour < 10 ? '0' : '') + hour + ':00';
        }
        format(options, date) {
            return Intl.DateTimeFormat('fi', options).format(date);
        }
    }
    return {default: DateUtils};
});
define('src/ioc',['src/ContentLayerFactory', 'src/DateUtils'], (ContentLayerFactory, DateUtils) => {
    'use strict';
    const cache = {};
    const cachify = (key, fn) => {
        if (!cache.hasOwnProperty(key)) {
            cache[key] = fn();
        }
        return cache[key];
    };
    return {default: {
        dateUtils: () => {
            return cachify('dateUtils', () => new DateUtils.default());
        },
        contentLayerFactory: () => {
            return cachify('contentLayerFactory', () => new ContentLayerFactory.default());
        }
    }};
});
define('src/Header',['src/Constants', 'src/ioc'], (Constants, ioc) => {
    'use strict';
    const dateUtils = ioc.default.dateUtils();
    /*
     * Kalenterin toolbarin alapuolelle renderöitävä headerline day-muodossa.
     *  ___________________________
     * |__________Toolbar__________|
     * |______--> Header <--_______|
     * |                           |
     * |         Content           |
     * |___________________________|
     */
    class DayHeader extends React.Component {
        /**
         * @param {object} props {dateCursor: {DateCursor}}
         */
        constructor(props) {
            super(props);
        }
        /**
         * Renderöi 1 * 2 headerlinen
         *
         * @access private
         */
        render() {
            return $el('div', {className: 'header'},
                $el('div', {className: 'row'},
                    $el('div', {className: 'col'}, $el('div', {className: 'cell'}, '')),
                    $el('div', {className: 'col'}, $el('div', {className: 'cell'}, this.formatDay(this.props.dateCursor.range.start)))
                )
            );
        }
        /**
         * Palauttaa {cursorStart} Date-objektista täydellisen viikonpäivän
         * nimen.
         *
         * @access private
         * @param {Date} cursorStart
         * @returns {string}
         */
        formatDay(cursorStart) {
            return Intl.DateTimeFormat('fi', {weekday: 'long'}).format(cursorStart);
        }
    }
    /*
     * Headerline week-muodossa.
     */
    class WeekHeader extends React.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
            this.DAYS = dateUtils.getFormattedWeekDays(
                this.props.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'short'})
            );
        }
        /**
         * Renderöi 1 * 2 headerlinen
         */
        render() {
            return $el('div', {className: 'header'},
                $el('div', {className: 'row'},
                    ([''].concat(this.DAYS)).map(content =>
                        $el('div', {key: content, className: 'col'}, $el('div', {className: 'cell'}, content))
                    )
                )
            );
        }
    }
    /*
     * Headerline month-muodossa.
     */
    class MonthHeader extends React.Component {
        /**
         * @param {object} props
         */
        constructor(props) {
            super(props);
            this.DAYS = dateUtils.getFormattedWeekDays(
                this.props.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'long'})
            );
        }
        /**
         * Renderöi 1 * 2 headerlinen
         */
        render() {
            return $el('div', {className: 'header'},
                $el('div', {className: 'row'},
                    this.DAYS.map(weekDay =>
                        $el('div', {key: weekDay ,className: 'col'}, $el('div', {className: 'cell'}, weekDay))
                    )
                )
            );
        }
    }
    return {
        [Constants.VIEW_DAY]: DayHeader,
        [Constants.VIEW_WEEK]: WeekHeader,
        [Constants.VIEW_MONTH]: MonthHeader
    };
});

define('src/Content',['src/Constants', 'src/ioc'], (Constants, ioc) => {
    'use strict';
    const HOURS_ARRAY = Array.from(Array(Constants.HOURS_IN_DAY).keys());
    /*
     * Kalenterin pääsisältö, renderöi ViewLayoutin generoiman gridin, ja lisää
     * valittujen sisältökerroksien (jos niitä on) luoman sisällön gridin soluihin.
     *  ___________________________
     * |__________Toolbar__________|
     * |__________Header___________|
     * |                           |
     * |      --> Content <--      |
     * |___________________________|
     */
    class Content extends React.Component {
        /**
         * @param {object} props {
         *     grid: {Array},
         *     calendarController: {Object}
         * }
         */
        constructor(props) {
            super(props);
            this.state = {};
            const selectedLayers = this.props.calendarController.settings.contentLayers;
            this.hasAsyncContent = selectedLayers.length > 0;
            if (this.hasAsyncContent) {
                const contentLayerFactory = ioc.default.contentLayerFactory();
                this.contentLayers = selectedLayers.map(name =>
                    contentLayerFactory.make(name, [
                        {refresh: () => {
                            this.applyAsyncContent();
                            this.forceUpdate();
                        }},
                        this.props.calendarController
                    ])
                );
                this.loadAsyncContent();
            }
        }
        /**
         * Poistaa props.gridistä sisältökerroksien modifikaatiot (children &
         * clickHandlers).
         */
        resetGrid() {
            return this.props.grid.map(rows => rows.map(cell => {
                if (cell && !(cell instanceof ImmutableCell)) {
                    cell.children = [];
                    cell.clickHandlers = [];
                }
            }));
        }
        /**
         * Triggeröi sisältökerroksien päivityksen, jos niitä on.
         */
        componentWillReceiveProps() {
            if (this.hasAsyncContent) {
                this.setState({loading: true});
                this.loadAsyncContent();
            }
        }
        /**
         * Lataa & ajaa sisältökerrokset, esim. eventLayerin tapahtumat.
         *
         * @access private
         */
        loadAsyncContent() {
            return Promise.all(this.contentLayers.map(l => l.load())).then(() => {
                this.applyAsyncContent();
                this.setState({loading: false});
            });
        }
        /**
         * Traversoi kalenterin jokaisen sisältösolun, ja tarjoaa ne sisältökerroksien
         * dekoroitavaksi. Sisältökerros voi tällöin esim. lisätä solun children-,
         * tai clickHandlers-taulukkoon omat lisäyksensä.
         *
         * @access private
         */
        applyAsyncContent() {
            this.resetGrid();
            this.contentLayers.forEach(layer => {
                this.props.grid.forEach(row => {
                    row.forEach(cell => {
                        (cell instanceof Cell) && layer.decorateCell(cell);
                    });
                });
            });
        }
        /**
         * @access private
         * @param {Cell} cell
         * @param {string} key
         * @returns {VNode}
         */
        newCell(cell, key) {
            let content;
            if (!cell) {
                content = '';
            } else if (!cell.children || !cell.children.length) {
                content = cell.content;
            } else {
                content = this.newTitledContent(cell);
            }
            const cellAttrs = {className: 'cell'};
            if (cell && cell.clickHandlers && cell.clickHandlers.length) {
                cellAttrs.onClick = e => {
                    if (e.which && e.which !== 1) { return; }
                    cell.clickHandlers.forEach(fn => fn(cell, e));
                };
            }
            return $el('div', {className: 'col', key},
                $el('div', cellAttrs, content)
            );
        }
        /**
         * @access private
         * @param {Cell} cell
         * @returns {VNode}
         */
        newTitledContent(cell) {
            return $el('div', null,
                // Title
                cell.content,
                // Sisältö
                cell.children.map((child, i) =>
                    $el(child.Component, Object.assign({}, child.props, {key: i}))
                )
            );
        }
        render() {
            return $el('div', {className: 'main'}, this.props.grid.map((row, ri) =>
                $el('div', {className: 'row', key: ri},
                    row.map((cell, ci) => this.newCell(cell, ri+'.'+ci)
                ))
            ));
        }
    }
    class Cell {
        constructor(content, date) {
            this.date = date;
            this.content = content;
            this.children = [];
            this.clickHandlers = [];
        }
    }
    class PlaceholderCell extends Cell {}
    class ImmutableCell {
        constructor(content) {
            this.content = content;
        }
    }
    return {default: Content, Cell, ImmutableCell, PlaceholderCell, HOURS_ARRAY};
});
define('src/ComponentConstruct',[],() => {
    'use strict';
    class ComponentConstruct {
        constructor(Component, props) {
            this.Component = Component;
            this.props = props;
        }
    }
    return {default: ComponentConstruct};
});
define('src/AbstractViewLayout',['src/Header', 'src/Content', 'src/ComponentConstruct', 'src/ioc'], (Header, Content, ComponentConstruct, ioc) => {
    'use strict';
    /*
     * ViewLayoutien juuriluokka
     */
    class AbstractViewLayout {
        /**
         * @param {DateCursor} dateCursor
         */
        constructor(dateCursor) {
            this.dateCursor = dateCursor;
            this.dateUtils = ioc.default.dateUtils();
        }
        /**
         * @access public
         * @param {boolean} compactFormShouldBeUsed
         * @returns {Array}
         */
        getParts(compactFormShouldBeUsed) {
            return !compactFormShouldBeUsed ? this.getFullLayout() : this.getCompactLayout();
        }
        /**
         * @access protected
         * @returns {Array}
         */
        getFullLayout() {
            return [
                new ComponentConstruct.default(Header[this.getName()], {dateCursor: this.dateCursor}),
                new ComponentConstruct.default(Content.default, {gridGeneratorFn: () => this.generateFullGrid()})
            ];
        }
        /**
         * @access protected
         * @returns {Array}
         */
        getCompactLayout() {
            return [
                null,
                new ComponentConstruct.default(Content.default, {gridGeneratorFn: () => this.generateCompactGrid()})
            ];
        }
    }
    return {default: AbstractViewLayout};
});
define('src/DayViewLayout',['src/AbstractViewLayout', 'src/Content', 'src/Constants'], (AbstractViewLayout, Content, Constants) => {
    'use strict';
    /*
     * Kalenterin pääsisältö day-muodossa.
     */
    class DayViewLayout extends AbstractViewLayout.default {
        getName() {
            return Constants.VIEW_DAY;
        }
        /**
         * Day-näkymällä ei ole erillistä compact-muotoa.
         *
         * @access protected
         * @returns {Array}
         */
        getCompactLayout() {
            return this.getFullLayout();
        }
        /**
         * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
         * ja yksi päiväsarake. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
         * `mm:ss` wrapattuna Content.ImmutableCell-instanssiin, ja sisältösarakkeen
         * sisältönä aina null wrapattuna Content.Cell-instanssiin.
         *
         * @access protected
         * @returns {Array}
         */
        generateFullGrid() {
            const rollingDate = new Date(this.dateCursor.range.start);
            // Päivän jokaiselle tunnille rivi, ...
            return Content.HOURS_ARRAY.map(hour => {
                rollingDate.setHours(hour);
                // jossa tuntisarake, ja sisältösarake.
                return [
                    new Content.ImmutableCell(this.dateUtils.formatHour(hour)),
                    new Content.Cell(null, new Date(rollingDate))
                ];
            });
        }
    }
    return {default: DayViewLayout};
});
define('src/WeekViewLayout',['src/AbstractViewLayout', 'src/Content', 'src/Constants'], (AbstractViewLayout, Content, Constants) => {
    'use strict';
    /*
     * Kalenterin pääsisältö week, ja week-compact -muodossa.
     */
    class WeekViewLayout extends AbstractViewLayout.default {
        getName() {
            return Constants.VIEW_WEEK;
        }
        /**
         * Generoi vuorokauden jokaiselle tunnille rivin, jossa yksi tuntisarake,
         * ja 7 päiväsaraketta. Tuntisarakkeen sisältönä vuorokauden tunti muodossa
         * `mm:ss` wrapattuna Content.ImmutableCell-instanssiin, ja sisältösarakkeen
         * sisältönä aina null wrapattuna Content.Cell-instanssiin.
         *
         * @access protected
         * @returns {Array}
         */
        generateFullGrid() {
            // Vuorokauden jokaiselle tunnille rivi, ...
            return Content.HOURS_ARRAY.map(hour => {
                const rollingDate = new Date(this.dateCursor.range.start);
                rollingDate.setHours(hour);
                // jossa tuntisarake, ...
                const row = [new Content.ImmutableCell(this.dateUtils.formatHour(hour))];
                // ja sarakkeet jokaiselle viikonpäivälle
                while (row.push(new Content.Cell(null, new Date(rollingDate))) <= Constants.DAYS_IN_WEEK) {
                    rollingDate.setDate(rollingDate.getDate() + 1);
                }
                return row;
            });
        }
        /**
         * Generoi viikonpäivien nimet täydellisessä muodossa 2 * 4 taulukkoon
         * Content.Cell-instansseihin wrapattuna.
         *
         * @access protected
         * @returns {Array}
         */
        generateCompactGrid() {
            const dayNames = this.dateUtils.getFormattedWeekDays(
                this.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'long'})
            );
            const rollingDate = new Date(this.dateCursor.range.start);
            const getDateAndMoveToNexDay = () => {
                const d = new Date(rollingDate);
                rollingDate.setDate(rollingDate.getDate() + 1);
                return d;
            };
            return [
                [
                    new Content.Cell(dayNames[0], getDateAndMoveToNexDay()),
                    new Content.Cell(dayNames[1], getDateAndMoveToNexDay())
                ], [
                    new Content.Cell(dayNames[2], getDateAndMoveToNexDay()),
                    new Content.Cell(dayNames[3], getDateAndMoveToNexDay())
                ], [
                    new Content.Cell(dayNames[4], getDateAndMoveToNexDay()),
                    new Content.Cell(dayNames[5], getDateAndMoveToNexDay())
                ], [
                    new Content.Cell(dayNames[6], getDateAndMoveToNexDay()),
                    new Content.PlaceholderCell(null, null)
                ]
            ];
        }
    }
    return {default: WeekViewLayout};
});
define('src/MonthViewLayout',['src/AbstractViewLayout', 'src/Content', 'src/Constants'], (AbstractViewLayout, Content, Constants) => {
    'use strict';
    /*
     * Kalenterin pääsisältö month, ja month-compact -muodossa
     */
    class MonthViewLayout extends AbstractViewLayout.default {
        getName() {
            return Constants.VIEW_MONTH;
        }
        /**
         * Generoi kuukauden päivät numeerisessa muodossa 7 * ~5 taulukkoon Content.Cell-
         * instansseihin wrapattuna. Ensimmäisen rivina alussa, ja viimeisen rivin
         * lopussa voi olla undefined-soluja.
         *
         * @access protected
         * @returns {Array}
         */
        generateFullGrid() {
            return this.generateGrid(Constants.DAYS_IN_WEEK, d =>
                new Content.Cell(d.getDate(), new Date(d))
            );
        }
        /**
         * Generoi kuukauden päivät muodossa `{pvmNumeerinen} + {viikonPäiväLyhyt}`
         * 2 * ~15 taulukkoon Content.Cell-instansseihin wrapattuna.
         *
         * @access protected
         * @returns {Array}
         */
        generateCompactGrid() {
            const dayNames = this.dateUtils.getFormattedWeekDays(
                this.dateCursor.range.start,
                Intl.DateTimeFormat('fi', {weekday: 'short'})
            );
            return this.generateGrid(2, d => new Content.Cell(
                d.getDate() + ' ' + dayNames[(d.getDay() || 7) - 1], new Date(d)
            ));
        }
        /**
         * Generoi kuukauden kaikki päivät {gridWidth} * {?} taulukkoon. Ensimmäisen
         * rivin alkuun, ja viimeisen rivin loppuun lisätään "tyhjää", jos kuukauden
         * ensimmäinen päivä ei ole maanantai, tai viimeinen sunnuntai (ja {gridWith} = 7).
         * Esimerkkipaluuarvo, jos kuukauden ensimmäinen päivä on keskiviikko;
         * [[undefined, undefined, 1, 2 ...], [6, 7...], ...]. Solujen sisältö
         * määräytyy {formatFn}:n mukaan.
         *
         * @access private
         * @param {number} gridWidth
         * @param {Function} formatFn fn({Date} d || undefined)
         * @returns {Array}
         */
        generateGrid(gridWidth, formatFn) {
            const startDate = this.dateCursor.range.start;
            const rollingDate = new Date(startDate);
            const grid = [];
            let row = [];
            // Lisää ensimmäisen rivin "tyhjät, jos kyseessä Ma-Su grid
            if (gridWidth === Constants.DAYS_IN_WEEK) {
                row.length = (startDate.getDay() || 7) - 1;
                row.fill(undefined);
            }
            // Lisää kuukauden päivät {gridWith} levyisinä riveinä
            while (rollingDate.getMonth() === startDate.getMonth()) {
                row.push(formatFn(rollingDate));
                if (row.length === gridWidth) { grid.push(row); row = []; }
                rollingDate.setDate(rollingDate.getDate() + 1);
            }
            // Tasaa viimeinen rivi
            if (row.length) {
                while (row.push(undefined) < gridWidth) {/**/}
                grid.push(row);
            }
            return grid;
        }
    }
    return {default: MonthViewLayout};
});
define('src/ViewLayouts',['src/DayViewLayout', 'src/WeekViewLayout', 'src/MonthViewLayout', 'src/Constants'], (DayViewLayout, WeekViewLayout, MonthViewLayout, Constants) => {
    'use strict';
    return {
        [Constants.VIEW_DAY]: DayViewLayout.default,
        [Constants.VIEW_WEEK]: WeekViewLayout.default,
        [Constants.VIEW_MONTH]: MonthViewLayout.default
    };
});

define('src/DateCursors',['src/Constants', 'src/ioc'], (Constants, ioc) => {
    'use strict';
    const dateUtils = ioc.default.dateUtils();
    class DayViewCursorRange {
        constructor(currentDate) {
            this.start = dateUtils.getStartOfDay(currentDate);
            this.end = dateUtils.getEndOfDay(currentDate);
        }
        goForward() {
            this.start.setDate(this.start.getDate() + 1);
            this.end.setDate(this.end.getDate() + 1);
        }
        goBackwards() {
            this.start.setDate(this.start.getDate() - 1);
            this.end.setDate(this.end.getDate() - 1);
        }
    }
    class WeekViewCursorRange {
        constructor(currentDate) {
            this.start = dateUtils.getStartOfWeek(dateUtils.getStartOfDay(currentDate));
            this.end = dateUtils.getEndOfDay(this.start);
            this.end.setDate(this.start.getDate() + 6);
        }
        goForward() {
            this.start.setDate(this.start.getDate() + Constants.DAYS_IN_WEEK);
            this.end.setDate(this.end.getDate() + Constants.DAYS_IN_WEEK);
        }
        goBackwards() {
            this.start.setDate(this.start.getDate() - Constants.DAYS_IN_WEEK);
            this.end.setDate(this.end.getDate() - Constants.DAYS_IN_WEEK);
        }
    }
    class MonthViewCursorRange {
        constructor(currentDate) {
            this.start = dateUtils.getStartOfDay(currentDate);
            this.start.setDate(1);
            this.end = dateUtils.getEndOfDay(currentDate);
            // https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
            this.end.setMonth(this.start.getMonth() + 1);
            this.end.setDate(0);// 1. pvä - 1 (0) = edellisen kuun viimeinen
        }
        goForward() {
            this.start.setMonth(this.start.getMonth() + 1);
            this.start.setDate(1);
            this.end.setMonth(this.end.getMonth() + 2);
            this.end.setDate(0);
        }
        goBackwards() {
            this.start.setMonth(this.start.getMonth() - 1);
            this.start.setDate(1);
            this.end.setDate(0);
        }
    }
    /*
     * Luokka joka vastaa kalenterin aikakursorin manipuloinnista
     * selaustoimintojen yhteydessä. Kuuluu osaksi Calendar-komponenttia, ja
     * public API:a.
     */
    class DateCursor {
        constructor(range, subsribeFn) {
            this.range = range;
            if (subsribeFn) {
                this.subscribe(subsribeFn);
            }
        }
        /**
         * Asettaa {subscribeFn}:n funktioksi, joka triggeröidään jokaisen
         * selaustapahtuman yhteydessä.
         */
        subscribe(subscribeFn) {
            this.notify = subscribeFn;
        }
        /**
         * Siirtää kursoria eteenpäin Calendarin "currentView"-arvosta riippuen
         * 24h, 7pvä tai 1kk.
         */
        next() {
            this.range.goForward();
            this.notify('next');
        }
        /**
         * Siirtää kursoria taaksepäin Calendarin "currentView"-arvosta riippuen
         * 24h, 7pvä tai 1kk.
         */
        prev() {
            this.range.goBackwards();
            this.notify('prev');
        }
        /**
         * Siirtää kursorin takaisin nykyhetkeen.
         */
        reset() {
            this.range = new this.range.constructor(new Date());
            this.notify('reset');
        }
        goTo() {
            this.notify('goTo');
        }
    }
    const cursorRanges = {
        [Constants.VIEW_DAY]: DayViewCursorRange,
        [Constants.VIEW_WEEK]: WeekViewCursorRange,
        [Constants.VIEW_MONTH]: MonthViewCursorRange
    };
    const dateCursorFactory = {newCursor: (viewName, subscriberFn) => {
        return new DateCursor(new cursorRanges[viewName](new Date()), subscriberFn);
    }};
    return {dateCursorFactory};
});
define('src/settingsFactory',['src/Constants'], (Constants) => {
    'use strict';
    /**
     * Palauttaa validin näkymän nimen, tai heittää errorin jos sitä ei löytynyt
     * Constants-objektista (VIEW_{viewNameKeyIsoillaKirjaimilla}).
     *
     * @param {String} viewNameKey
     * @throws {Error}
     */
    function getValidViewName(viewNameKey) {
        const lookedUpViewName = Constants['VIEW_' + viewNameKey.toUpperCase()];
        if (!lookedUpViewName) {
            throw new Error('Näkymää "' + viewNameKey + '" ei löytynyt');
        }
        return lookedUpViewName;
    }
    /**
     * Palattaa validin contentLayers-arvon, tai heittää errorin jos {candidate}
     * ei ollut validi.
     *
     * @param {Array} candidate
     * @throws {Error}
     */
    function getValidContentLayers(candidate) {
        if (!candidate) {
            return [];
        }
        if (!Array.isArray(candidate)) {
            throw new Error('contentLayers pitäisi olla taulukko');
        }
        return candidate;
    }
    /**
     * Palauttaa validin titleFormatters-, tai tyhjän objektin, tai heittää
     * errorin jos jokin {candidaten} arvoista ei ollut validi.
     *
     * @param {Object} candidate {
     *     [Constants.VIEW_DAY]: {Function},
     *     [Constants.VIEW_WEEK]: {Function},
     *     [Constants.VIEW_MONTH]: {Function}
     * }
     * @throws {Error}
     */
    function getValidTitleFormatters(candidate) {
        if (!candidate) {
            return {};
        }
        for (const viewNameKey in candidate) {
            if (typeof candidate[viewNameKey] !== 'function') {
                throw new Error('titleFormatters[' + viewNameKey + '] pitäisi olla funktio');
            }
            if (viewNameKey !== Constants.VIEW_DAY &&
                viewNameKey !== Constants.VIEW_WEEK &&
                viewNameKey !== Constants.VIEW_MONTH) {
                throw new Error('"' + viewNameKey + '" ei ole validi näkymä');
            }
        }
        return candidate;
    }
    return {
        /**
         * Palauttaa validin settings-objektin, tai heittää errorin jos jokin
         * {userSettings}in arvo ei ollut validi.
         *
         * @param {Object=} userSettings
         * @returns {Object} {
         *     defaultView: {string=},
         *     contentLayers: {Array=},
         *     titleFormatters: {Object=}
         * }
         */
        default: function (userSettings) {
            return {
                defaultView: getValidViewName(userSettings.defaultView || 'default'),
                contentLayers: getValidContentLayers(userSettings.contentLayers),
                titleFormatters: getValidTitleFormatters(userSettings.titleFormatters)
            };
        },
        getValidViewName
    };
});
define('src/CalendarLayout',['src/Modal', 'src/Toolbar', 'src/ViewLayouts', 'src/DateCursors', 'src/Constants', 'src/settingsFactory'], (Modal, Toolbar, ViewLayouts, DateCursors, Constants, settingsFactory) => {
    'use strict';
    const smallScreenCondition = window.matchMedia('(max-width:800px)');
    /*
     * Kalenterin juurikomponentti.
     */
    class CalendarLayout extends React.Component {
        /**
         * @param {object} props {
         *     settings: {
         *         defaultView: {string},
         *         titleFormatters: {Object},
         *         contentLayers: {Array}
         *     }=
         * }
         */
        constructor(props) {
            super(props);
            this.settings = settingsFactory.default(this.props.settings || {});
            const state = {dateCursor: this.newDateCursor(this.settings.defaultView)};
            state.currentView = this.settings.defaultView;
            state.viewLayout = this.newViewLayout(state.currentView, state.dateCursor);
            state.smallScreenConditionMaches = smallScreenCondition.matches;
            this.state = state;
            this.controller = newController(this);
        }
        /**
         * Lisää matchmedia-kuuntelijan.
         */
        componentWillMount() {
            smallScreenCondition.addListener(this.viewPortListener.bind(this));
        }
        /**
         * Palauttaa per-kalenteri-API:n, jonka kautta kalenteria pääsääntöisesti
         * kontrolloidaan.
         */
        getController() {
            return this.controller;
        }
        /**
         * Vaihtaa kalenterin currentView:iksi {to}, mikäli se ei ole jo valmiiksi,
         * uudelleeninstantioi dateCursorin, ja triggeröi sisältökerroksien
         * uudelleenlatauksen.
         *
         * @access public
         * @param {string} to Constants.VIEW_DAY | Constants.VIEW_WEEK | Constants.VIEW_MONTH
         */
        changeView(to) {
            const newView = settingsFactory.getValidViewName(to);
            if (this.state.currentView === newView) {
                return;
            }
            const state = {dateCursor: this.newDateCursor(newView)};
            state.currentView = newView;
            state.viewLayout = this.newViewLayout(newView, state.dateCursor);
            this.setState(state);
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
         * @returns {DateCursor}
         */
        newDateCursor(viewName) {
            return DateCursors.dateCursorFactory.newCursor(viewName, () => {
                this.setState({dateCursor: this.state.dateCursor});
            });
        }
        /**
         * @access private
         * @return {Day|Week|MonthViewLayout}
         */
        newViewLayout(viewName, dateCursor) {
            return new ViewLayouts[viewName](dateCursor);
        }
        /**
         * Renderöi kalenterin kokonaisuudessaan mutaatiossa day, week,
         * week-compact, month, tai month-compact.
         */
        render() {
            //
            let className = 'cal ' + this.state.currentView;
            if (this.state.smallScreenConditionMaches &&
                this.state.currentView !== Constants.VIEW_DAY) {
                className += '-compact compact';
            }
            //
            const [header, content] = this.state.viewLayout.getParts(
                this.state.smallScreenConditionMaches
            );
            return $el('div', {className},
                $el(Modal.default, {ref: cmp => {
                    this.modal = cmp;
                }}),
                $el(Toolbar.default, {
                    calendarController: this.controller,
                    titleFormatter: this.settings.titleFormatters[this.state.currentView] || null
                }),
                header !== null && $el(header.Component,
                    header.props
                ),
                $el(content.Component, {
                    grid: content.props.gridGeneratorFn(),
                    calendarController: this.controller
                })
            );
        }
    }
    /**
     * Yksittäisen kalenteri-instanssin public API. Käytetään myös sisäisesti
     * lapsikomponenteissa (Content, Toolbar).
     */
    function newController(component) {
        return {
            get currentView() {
                return component.state.currentView;
            },
            get dateCursor() {
                return component.state.dateCursor;
            },
            get settings() {
                return component.settings;
            },
            get isCompactViewEnabled() {
                return component.state.smallScreenConditionMaches;
            },
            changeView: to => {
                return component.changeView(to);
            },
            openModal: componentConstruct => {
                component.modal.open(componentConstruct);
            },
            closeModal: () => {
                component.modal.close();
            }
        };
    }
    return {default: CalendarLayout};
});

define('nullcalendar',['src/CalendarLayout', 'src/ioc'], (CalendarLayout, ioc) => {
    'use strict';
    const contentLayerFactory = ioc.default.contentLayerFactory();
    /**
     * Kirjaston public API.
     */
    return {
        /**
         * @param {HTMLElement} el DOM-elementti johon kalenteri renderöidään
         * @param {Object} settings Kalenterin configuraatio
         * @return {Object} Kalenteri-instanssin kontrolleri/API
         */
        newCalendar: (el, settings) => {
            return ReactDOM.render($el(CalendarLayout.default, settings ? {settings} : undefined), el).getController();
        },
        /**
         * @param {string} name Nimi, jolla rekisteröidään
         * @param {Object} Class Sisältökerroksen implementaatio
         */
        registerContentLayer: (name, Class) =>
            contentLayerFactory.register(name, Class)
    };
});
    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    return require('nullcalendar');
}));
