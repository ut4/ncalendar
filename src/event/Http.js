class Http {
    constructor(fetch, baseUrl) {
        this.fetch = fetch || function () {
            return window.fetch(...arguments);
        };
        this.baseUrl = baseUrl;
    }
    /**
     * @param {string} url
     * @returns {Promise}
     */
    get(url) {
        return this.newRequest(url, {method: 'GET'});
    }
    /**
     * @param {string} url
     * @param {Object|string} data
     * @returns {Promise}
     */
    post(url, data) {
        return this.newRequest(url, {method: 'POST', body: data});
    }
    /**
     * @param {string} url
     * @param {Object|string} data
     * @returns {Promise}
     */
    put(url, data) {
        return this.newRequest(url, {method: 'PUT', body: data});
    }
    /**
     * @param {string=} url
     * @returns {Promise}
     */
    delete(url) {
        return this.newRequest(url, {method: 'DELETE'});
    }
    /**
     * @param {string=} url
     * @param {Object=} options
     * @returns {Promise}
     */
    newRequest(url, options) {
        if (typeof options.body === 'object') {
            options.body = toJson(options.body);
        }
        return this.fetch(this.baseUrl + url || '', options).then(checkResponse).then(parseResponse);
    }
}
/**
 * Heittää poikkeuksen, jos response != ok.
 *
 * @param {Response} response
 * @returns {Response}
 * @throws {Error}
 */
function checkResponse(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}
/**
 * @param {Response} response
 * @returns {Promise}
 */
function parseResponse(response) {
    return response.json();
}
/**
 * Sama kuin JSON.stringify, mutta säilyttää serialisoitujen Date-objektien
 * aikavyöhyketiedot.
 *
 * @param {Object} obj
 * @returns {string}
 */
function toJson(obj) {
    const cloned = {};
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        cloned[key] = !(obj[key] instanceof Date) ? obj[key] : obj[key].toISOString();
    }
    return JSON.stringify(cloned);
}

export default Http;
