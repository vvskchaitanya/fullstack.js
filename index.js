var compiler = require('./main/compiler');
var server = require('./main/server');

start = function(){
    compiler.compile();
    server.serve();
    console.log("Serving - http://localhost:9999");
    console.log("App Server Stared.");
}

module.exports = { start };
