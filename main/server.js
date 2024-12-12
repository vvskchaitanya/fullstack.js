const http = require("http");
const fs = require("fs");
const path = require('path');


serve=function(){
    const server = http.createServer((req, res) => {
        let url = req.url;
        console.log("Request URL: "+req.url);
        if(url.indexOf("/ui/")==0){
          serve_ui(req.url,res);
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

serve_ui=function(url,res){
  const filePath = path.join('ui', url.replace('/ui/', ''));
  console.log(filePath);

    // Get the file extension
    const ext = path.extname(filePath).toLowerCase();

    // Set the appropriate MIME type
    const mimeTypes = {
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

    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      // Read and serve the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
          return;
        }

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
      });
    });
}

module.exports = { serve };