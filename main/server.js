const http = require("http");
const fs = require("fs");


serve=function(){
    const server = http.createServer((req, res) => {
        let url = req.url;
        console.log("Request URL: "+req.url);
        if(url.indexOf("/ui/")==0){
          console.log("hit ui");
        }
        else if(url.indexOf("/api/")==0){
          console.log("hit api");
          res.writeHead(200,{"Content-Type":"application/json"});
          res.end(JSON.stringify({
            data: 'Hello World!'
          }));
        }else if(url.indexOf("/favicon")==0){
          res.writeHead(404);
          res.end();
        }else{
          var indexHtml = fs.existsSync("ui/index.html")?fs.readFileSync("ui/index.html"):"";
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(indexHtml);
          res.end();
        }  
    });
    server.listen(9999); 
}

module.exports = { serve };