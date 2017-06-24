define(['src/ContentLayerFactory', 'src/DateUtils'], (ContentLayerFactory, DateUtils) => {
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