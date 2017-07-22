import ContentLayerFactory from './ContentLayerFactory.js';
import DateUtils from './DateUtils.js';

const cache = {};
const cachify = (key, fn) => {
    if (!cache.hasOwnProperty(key)) {
        cache[key] = fn();
    }
    return cache[key];
};

export default {
    dateUtils: () => {
        return cachify('dateUtils', () => new DateUtils());
    },
    contentLayerFactory: () => {
        return cachify('contentLayerFactory', () => new ContentLayerFactory());
    }
};
