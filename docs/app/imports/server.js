const http = require("http");
const fs = require("fs");
const path = require('path');
const { error } = require("console");

const UI_TARGET = "target/ui";
const API_TARGET = "../target/api";
const UI_PORT = 9999;
const API_PORT = 8888;
const UI_PATH = "";
const API_PATH = "";

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

serve = function(){
  return [serve_ui(UI_PORT,UI_TARGET,UI_PATH),serve_api(API_PORT,API_TARGET,API_PATH)];
}

function serve_ui(port, target_dir, base_context){
  if(port==null){
    throw new error("Port is not specified");
  }
  if(target_dir==null && target_dir!=""){
    throw new error("Target dir not specified");
  }
  const server= http.createServer((req,res)=>{
    let url = req.url;
    console.log("UI: Request URL: "+req.url);
    if(base_context!=null && base_context!=""){
      if(base_context[0]!="/")base_context="/"+base_context;
      if(base_context[base_context.lenth-1]!="/") base_context+="/";
      url = url.replace(base_context,"");
    }
    const filePath = path.join(target_dir, url);
    fs.stat(filePath, (err, stats) => {
      if (err || stats==null) {
          res_writeFolder(target_dir,res);
      }
      else if (stats.isDirectory()) {
          res_writeFolder(filePath,res);
      }
      else if (stats.isFile()) {
          res_writeFile(filePath,res);
      }
    });
  });
   // Listen to port
   server.listen(port,()=>{
    console.log("Serving UI - http://localhost:"+port);
  });
  server.on('error',(err)=>{
    console.error("Unable to serve on "+port+". Port already in use.")
  });
  return server;
}

function serve_api(port, target_dir, base_context){
  const server = http.createServer((req, res) => {
    try {
      let url = req.url;
        console.log("API: Request URL: "+req.url);
        // Parse the context path from the URL
        const contextPath = new URL(url, `http://${req.headers.host}`).pathname;

        // Remove base_context from the context path
        const cleanedPath = contextPath.replace("/^\/"+base_context+"\//", '');

        // Resolve the file path
        const fileName = path.basename(cleanedPath) + '.js';
        const filePath = path.join(__dirname, target_dir , fileName);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end(`API ${url} not found.`);
            return;
        }

        // Require the file and execute the exported function
        const apiHandler = require(filePath);
        if (typeof apiHandler === 'function') {
            apiHandler(req, res);
        } else {
            res.statusCode = 500;
            res.end(`API file ${fileName} does not export a valid function.`);
        }
    } catch (error) {
        res.statusCode = 500;
        res.end(`Error processing API request: ${error.message}`);
    }
  });
  // Listen to port
  server.listen(port,()=>{
    console.log("Serving API - http://localhost:"+port);
  });
  server.on('error',(err)=>{
    console.error("Unable to serve on "+port+". Port already in use.")
  });
  return server;
}

res_writeFolder = function(folder,res){
  if(folder[folder.length-1]!="/")folder+="/"
  fs.readFile(folder+"index.html", (err, data) => {
    if (err || data==null) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
    }else{
        res.writeHead(200, { 'Content-Type': "text/html" });
        res.end(data);

    }
    
  });
}

res_writeFile=function(file,res){
  fs.readFile(file, (err, data) => {
    if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
    }
    res.writeHead(200, { 'Content-Type': getContentType(file) });
    res.end(data);
  });
}

getContentType = function(filePath){
  // Get the file extension
  let type = path.extname(filePath).toLowerCase();

  return MIME_TYPES[type] || 'application/octet-stream';
}

module.exports = { serve };
