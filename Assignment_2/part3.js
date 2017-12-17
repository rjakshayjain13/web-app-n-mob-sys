var http = require('http');
var url = require('url');
var LRU = require('lru-cache');
//var sleep = require('sleep');

var options = {
    server: 'www.public.asu.edu',
    port: 80,
    local_port: '8040',
    max_requests: 50,
    cache_size: 1024*100,
    freshness: 10*60*1000
    //delay: 1000
};
var cache = LRU(
    {
        maxAge: 600000,
        max: options.cache_size *1024,
        length: function(n, key){
            return n.length;
        },
        stale: false
    }
)

function pruneCache(){
    cache.prune();
    console.log("cache cleared");
}

setInterval(pruneCache, options.freshness);

// The method to be called when the server recieves a request
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
        //header: {}
    };
    
    // get clients browser record
    var br_rec = c_req.headers["user-agent"];

    // ensure this browser has its record in our browserRecords
    if (browserRecords[br_rec] === undefined) {
        browserRecords[br_rec] = [];
    }
    
    console.log(browserRecords[br_rec].length);
    // delete all requests timestamps, that are older than 10 minutes (10 * 60 * 1000 miliseconds)
    if (browserRecords[br_rec].length > 0 && browserRecords[br_rec][0] <= (Date.now() - (10 * 60 * 1000))) {
        browserRecords[br_rec].shift();
    }

    // if browser exceeded requests count
    if (browserRecords[br_rec].length >= reqOptions['max_requests']) {
        // log event
        console.log("Max Request limit exceeded! Connection Refused!");
        // return error
        c_res.statusCode = 429; // TOO MANY REQUESTS
        c_res.end("429 - MAX REQUEST EXCEEDED"); // end response

        // stop processing
        return;
    }

    // add timestamp to history
    browserRecords[br_rec].push(Date.now());

    // caching reset function
    if(c_req.method === "POST" && parsedURL.pathname == "/admin/reset"){
        cache.reset();
        c_res.statusCode = 200;
        c_res.end("Cache reset succesful");
        return;
    }

    // cache entry delete function
    if(c_req.method === "DELETE" && parsedURL.pathname == "/admin/cache"){
        var queryParam = new url.URLSearchParams(parsedURL.search);
        var cKey = queryParam.get('key');
        if(cache.has(cKey)){
            cache.del(cKey);
            c_res.statusCode = 200;
            c_res.end("Cache entry deleted");
        }
        else{
            c_res.statusCode = 404;
            c_res.end("Cache entry not found");
        }
        return;
    }

    // cache entry fetch function
    if(c_req.method === "GET" && parsedURL.pathname == "/admin/cache"){
        var queryParam = new url.URLSearchParams(parsedURL.search);
        var cKey = queryParam.get('key');
        if(cache.has(cKey)){
            var cValue = cache.get(cKey);
            c_res.writeHead(cValue.statusCode, cValue.headers);
            c_res.end(cValue.data, 'binary');
        }
        else{
            c_res.statusCode = 404;
            c_res.end("Cache entry not found");
        }
        return;
    }

    // cache entry addded if not present
    if(c_req.method === "PUT" && parsedURL.pathname == "/admin/cache"){
        
        var queryParam = new url.URLSearchParams(parsedURL.query);
        
        // fetching key value from url entered after ?
        var cKey = queryParam.get('key');
        var givenValue = queryParam.get('value');
        
        var valueObj = {
            data: givenValue,
            statusCode: 200,
            headers: []
        }
        cache.set(cKey, valueObj);
        c_res.statusCode = 200;
        c_res.end("cache entry created");
        return;
    }

    var cValue = cache.get(reqOptions.path);

    // checking if the Data existing or not
    if (cValue !== undefined)
    {
        console.log("Data found in cache");
  
        // respond from cache 
        c_res.writeHead(cValue.statusCode, cValue.headers);
        c_res.end(cValue.data, 'binary');

        // don't process further
        return;
    } 
    else
    {
        console.log("Data not found in cache! retrieving from server...");
    }

    var c_data = "";
    c_req.setEncoding('binary');
    c_req.on('data', function(chunk){
        c_data += chunk;
    });
    c_req.on('end',function(){
        reqOptions.method = c_req.method;
        reqOptions.headers = c_req.headers;
        
        var s_data = "";
        callbackFunc = function(res){
            res.setEncoding('binary');
            res.on('data',function(chunk){
                s_data += chunk;
            });
            res.on('end', function(){
                if (reqOptions.method === "GET")
                {
                   
                    // object to add to cache
                    var cacheEnty = { 
                        data: s_data, 
                        statusCode: res.statusCode,  
                        headers: res.headers
                    };
        
                    // add/update to cache
                    cache.set(reqOptions.path, cacheEnty);
        
                    console.log("Added to cache " + reqOptions.path);
                }

                //checking for redirects
                if(res.statusCode == 301 || res.statusCode == 302 || res.statusCode == 303 || res.statusCode == 307 || res.statusCode == 308){
                    var temp = url.parse(res.headers.location);
                    console.log(res.headers.location);
                    if(temp.protocol.startsWith("https")){
                        c_res.statusCode = 405;
                        c_res.end("https not supported");
                        return;
                    }
                    reqOptions.host = temp.hostname;
                    reqOptions.path = temp.path;
                    reqOptions.port = temp.port;

                    if(res.statusCode == 303){
                        reqOptions.method = "GET";
                        c_data = "";
                    }

                    s_data = "";
                    var s_req = http.request(reqOptions, callbackFunc).end(c_data,'binary');
                }
                else{
                    var ext = require('path').extname(reqOptions.path);
                    console.log(ext);
                    c_res.writeHead(res.statusCode,res.headers);
                    c_res.end(s_data, 'binary');
                }
            });
        }
        var request = http.request(reqOptions,callbackFunc).end(c_data, 'binary');
    });

}
// requests history per browser
var browserRecords = {};

function run() {
    var server = http.createServer(onRequest);
    console.log('Server started ...');
    server.listen(options.local_port);
    console.log('Listening to port: ' + options.local_port); 
}

run();
