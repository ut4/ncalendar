define(['src/ContentLayerFactory'], (ContentLayerFactory) => {
    'use strict';
    const cache = {};
    const cachify = (key, fn) => {
        if (!cache.hasOwnProperty(key)) {
            cache[key] = fn();
        }
        return cache[key];
    };
    return {default: {
        contentLayerFactory: () => {
            return cachify('contentLayerFactory', () => new ContentLayerFactory.default());
        }
    }};
});