const http = require("http");
const fs = require("fs");
const URL = require("url");
const crypto = require('crypto');
var compiler = require('./main/compiler');
var server = require('./main/server');


// global variables
const algorithm = "aes256";
const options = { encoding: "UTF-8" };


const timestamp = function(){
    return new Date().toUTCString();
}

api=function(req, api, res){
    var func = fs.readFileSync(api,options);
    var response = {status:false};
    try{
        response = eval(func);
    }catch(err){
        console.error(err);
        response = {success:false, code:500, error:"Service Error"};
    }
    return response;
}

start = function(){
    compiler.compile();
    server.serve();
    console.log("Serving - http://localhost:9999");
    console.log("App Server Stared.");
}

module.exports = { start };
