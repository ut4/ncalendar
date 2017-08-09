const http = require('http');
const parseUrl = require('url').parse;
const parseQ = require('querystring').parse;
const events = makeSomeEvents();

http.createServer((req, res) => {
    const url = parseUrl(req.url);
    const path = req.method + ':' + url.pathname;
    const params = parseQ(url.query);
    const pathParams = (path.match(/events\/(\d)/) || []).slice(1);
    let route = !pathParams.length ? path : path.replace('/' + pathParams.join('/'), '');
    route.endsWith('/') && (route = route.substr(0, route.length - 1));
    console.log('Got: ', path, route, pathParams, params);
    let requestBody = '';
    switch (route) {
        case 'POST:/events' :
            req.on('data', receiveData);
            req.on('end', () => {
                const newEvent = JSON.parse(requestBody);
                newEvent.id = events.length + 1;
                newEvent.start = new Date(newEvent.start);
                respond(JSON.stringify({insertId: events.push(newEvent)}));
            });
            break;
        case 'GET:/events' :
            if (params.from && params.to) {
                const from = new Date(params.from);
                const to = new Date(params.to);
                respond(JSON.stringify(events.filter(event =>
                    event.start >= from && event.start <= to
                )));
            } else {
                respond(JSON.stringify(events));
            }
            break;
        case 'PUT:/events' :
            req.on('data', receiveData);
            req.on('end', () => {
                const updated = JSON.parse(requestBody);
                updated.start = new Date(updated.start);
                console.log(pathParams[0], updated)
                events[events.indexOf(events.find(e => e.id === +pathParams[0]))] = updated;
                console.log(events)
                respond(JSON.stringify({updateCount: 1}));
            });
            break;
        case 'DELETE:/events' :
            events.splice(events.indexOf(events.find(e => e.id === +pathParams[0])), 1);
            respond(JSON.stringify({deleteCount: 1}));
            break;
        case 'OPTIONS:/events' :
            respond('');
            break;
        default :
            respond(`Route ${route} not found.`, 404);
            break;
    }
    function respond(body, status = 200) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(status);
        res.write(body);
        res.end();
    }
    function receiveData(chunk) {
        requestBody += chunk;
    }
}).listen(8080);

console.log('Check out http://localhost:8080/events');

function makeSomeEvents() {
    const now = new Date();
    return [
        {id: 1, start: new Date(now.getFullYear(), now.getMonth(), now.getDate()-2, 4, 0, 0, 0), title: 'Event 1'},
        {id: 2, start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 1), title: 'Event 2'},
        {id: 3, start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 30, 0, 0), title: 'Event 3'}
    ];
}