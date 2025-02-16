const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        return sendResponse(res, 400, { success: false, message: 'Invalid JSON' });
      }
      
      const { name, template, script, style } = data;
      if (!name) {
        return sendResponse(res, 400, { success: false, message: 'Component name is required.' });
      }
      
      // Build target folder: source/ui/components/<ComponentName>
      const componentFolder = path.join(__dirname, '../','../','source', 'ui', 'components', name);
      console.log("Saving Component: "+componentFolder);
      fs.mkdir(componentFolder, { recursive: true }, err => {
        if (err) {
          console.error('Error creating folder:', err);
          return sendResponse(res, 500, { success: false, message: 'Error creating component folder.', error: err });
        }
        
        // Write component.html
        fs.writeFile(path.join(componentFolder, name+'.html'), template || '', err1 => {
          if (err1) {
            console.error('Error writing component.html:', err1);
            return sendResponse(res, 500, { success: false, message: 'Error writing component.html.', error: err1 });
          }
          
          // Write style.css
          fs.writeFile(path.join(componentFolder, name+'.css'), style || '', err2 => {
            if (err2) {
              console.error('Error writing style.css:', err2);
              return sendResponse(res, 500, { success: false, message: 'Error writing style.css.', error: err2 });
            }
            
            // Write script.js
            fs.writeFile(path.join(componentFolder, name+'.js'), script || '', err3 => {
              if (err3) {
                console.error('Error writing script.js:', err3);
                return sendResponse(res, 500, { success: false, message: 'Error writing script.js.', error: err3 });
              }
              
              return sendResponse(res, 200, { success: true, message: 'Component saved successfully.' });
            });
          });
        });
      });
    });
};

// Helper function to send JSON responses with CORS headers
function sendResponse(res, statusCode, data) {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }