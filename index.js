var compiler = require('./main/compiler');
var server = require('./main/server');

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

module.exports = { start };
