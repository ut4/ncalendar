import ContentLayerFactory from './ContentLayerFactory.js';

const cache = {};
const cachify = (key, fn) => {
    if (!cache.hasOwnProperty(key)) {
        cache[key] = fn();
    }
    return cache[key];
};

export default {
    contentLayerFactory: () => {
        return cachify('contentLayerFactory', () => new ContentLayerFactory());
    }
};
