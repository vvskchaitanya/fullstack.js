const http = require("http");
const fs = require("fs");
const path = require('path');


serve=function(){
    const server = http.createServer((req, res) => {
        let url = req.url;
        console.log("Request URL: "+req.url);
        if(url.indexOf("/ui/")==0){
          serve_ui(req.url,res);
        }else if(url.indexOf("/api/")==0){
          serve_api(url,req,res);
        }else if(url=="" || url=="/" || url=="/index.html"){
          var indexHtml = fs.existsSync("ui/index.html")?fs.readFileSync("ui/index.html"):"";
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(indexHtml);
          res.end();
        }else{
          res.writeHead(404);
          res.end();
        }  
    });
    server.listen(9999); 
}

serve_ui=function(url,res){
  const filePath = path.join('ui', url.replace('/ui/', ''));

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

function serve_api(url, req, res) {
    try {
        // Parse the context path from the URL
        const contextPath = new URL(url, `http://${req.headers.host}`).pathname;

        // Remove '/api/' from the context path
        const cleanedPath = contextPath.replace(/^\/api\//, '');

        // Resolve the file path
        const fileName = path.basename(cleanedPath) + '.js';
        const filePath = path.join(__dirname, 'api', fileName);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end(`API file ${fileName} not found.`);
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
}

module.exports = { serve };
