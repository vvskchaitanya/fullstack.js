var compiler = require('./compiler');
var server = require('./server');
var builder = require('./builder');

// global variables
const algorithm = "aes256";
const options = { encoding: "UTF-8" };

const timestamp = function(){
    return new Date().toUTCString();
}

start = function(){
    compiler.compile();
    server.serve();
    console.log("Serving - http://localhost:9999");
    console.log("App Server Stared.");
}

build = function(){
    builder.build();
    console.log("Build Successfull")
}

module.exports = { start, build };
