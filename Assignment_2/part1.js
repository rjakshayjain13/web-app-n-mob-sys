var http = require('http');
var url = require('url');

var options = {
   server: 'www.public.asu.edu',
   port: 80,
   local_port: '8766'
};

// The method to be called when the server receives a request
function onRequest(c_req, c_res) {
    
    var parsedURL = url.parse(c_req.url);
    //console.log("parsed")
    var reqOptions = {
        host: options.server,
        path: parsedURL.path,
        port: options.port,
        localport: options.local_port,
        //header: {}
    };
   console.log('Method used: ' + c_req.method);
   
   if (c_req.method == 'GET') {       // When the request method is 'GET'
   
       console.log('Path used: ' + reqOptions.path);

       var webProxyServer = http.request(reqOptions, function (res) {      // A proxy to send a request to the target server
           console.log('Requesting from: ' + reqOptions.host + reqOptions.path);
           
            if (res.statusCode >= 300 && res.statusCode <= 399) {     
               console.log('300 Level Status Code.');
               c_res.end('Redirect error: ' + res.statusCode);   
           } else {                                               
               console.log('Returning response: ' + res.statusCode);   // Pipe the whole server response to the client response
               res.pipe(c_res, { end: true });                   
           }
       });
       // pipe the proxy to the client request
       c_req.pipe(webProxyServer, { end: true });
       console.log('Piping content...');
   } else {
       // Any request method other than 'GET' will be rejected
       c_res.end('Not \'GET\' method.');
       console.log('Not \'GET\' method requested.');
   }
}

function run() {
   var server = http.createServer(onRequest);
   console.log('Server started...');
   server.listen(options.local_port);
   console.log('Listening to port: ' + options.local_port);
}

run();