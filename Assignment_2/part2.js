var http = require('http');
var url = require('url');
//var sleep = require('sleep');

// options object as per the requirements
var options = {
    server: 'www.public.asu.edu',
    port: 80,
    local_port: '8040',
    max_requests: 50
    //delay: 1000
};

// The method to be called when the server receives a request
function onRequest(c_req, c_res) {

    console.log('Method used: ' + c_req.method);

    //sleep.msleep(options.delay);
    var parsedURL = url.parse(c_req.url);

    var reqOptions = {

        host: options.server,
        path: parsedURL.path,
        port: options.port,
        localport: options.local_port,
        max_requests: options.max_requests
    };

    // get clients browser record
    var br_rec = c_req.headers["user-agent"];

    // ensure this browser has its record in our browserRecords
    if (browserRecords[br_rec] === undefined) {
        browserRecords[br_rec] = [];
    }

    // delete the timestamps older than 10 minutes (= 10 * 60 * 1000 miliseconds)
    if (browserRecords[br_rec].length > 0 && browserRecords[br_rec][0] <= (Date.now() - (10 * 60 * 1000))) {
        browserRecords[br_rec].shift();
    }

    // if browser exceeds max_requests
    if (browserRecords[br_rec].length >= reqOptions['max_requests']) {
        console.log("Max Request limit exceeded! Connection Refused!");
        c_res.statusCode = 429; // TOO MANY REQUESTS
        c_res.end("429 - MAX REQUEST EXCEEDED!"); // end response
        return;
    }

    // add timestamp for the new request to browserRecords
    browserRecords[br_rec].push(Date.now());

    var c_data = "";

    c_req.setEncoding('binary');// allows us to get all kinds of data

    //storing data coming in client request in a string
    c_req.on('data', function (chunk) {
        c_data += chunk;
    });

    // processing the data in an event handler
    c_req.on('end', function () {

        reqOptions.method = c_req.method;
        reqOptions.headers = c_req.headers;

        reqOptions.headers['host'] = reqOptions.host + ":" + reqOptions.port;

        var s_data = "";

        callbackFunc = function (res) {

            res.setEncoding('binary');

            res.on('data', function (chunk) {
                s_data += chunk;
            });

            res.on('end', function () {

                // Handling Redirect errors by parsing the new URL
                if (res.statusCode == 301 || res.statusCode == 302 || res.statusCode == 303 || res.statusCode == 307 || res.statusCode == 308) {
                    var temp = url.parse(res.headers.location);
                    console.log(res.headers.location);

                    if (temp.protocol.startsWith("https")) {

                        c_res.statusCode = 405;// Method not allowed
                        c_res.end("405 - HTTPS REDIRECT DENIED!");// end response

                        return;
                    }

                    reqOptions.host = temp.hostname;
                    reqOptions.path = temp.path;
                    reqOptions.port = temp.port;
                    reqOptions.headers['host'] = temp.host + ":" + ((temp.port == null) ? '80' : temp.port);

                    //Since 303 error makes it a compulsion to use GET instead of POST request
                    if (res.statusCode == 303) {
                        reqOptions.method = "GET";
                        c_data = "";
                    }

                    s_data = "";
                    var s_req = http.request(reqOptions, callbackFunc).end(c_data, 'binary');
                }
                else {
                    // No redirect ERROR
                    var ext = require('path').extname(reqOptions.path);
                
                    c_res.writeHead(res.statusCode, res.headers);
                    c_res.end(s_data, 'binary');
                }
            });
        }
        var request = http.request(reqOptions, callbackFunc).end(c_data, 'binary');
    });
}

// stores every browser's record
var browserRecords = {};

function run() {
    
    // creates a new instance of http.Server
    var server = http.createServer(onRequest);
    console.log('Server started...');
    
    //Begins accepting connections on the specified port
    server.listen(options.local_port);
    console.log('Listening to port: ' + options.local_port);
}

run();