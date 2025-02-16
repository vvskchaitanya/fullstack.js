const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    let page;
    try {
      page = JSON.parse(body);
    } catch (e) {
      return sendResponse(res, 400, { success: false, message: 'Invalid JSON' });
    }

    if (!page.name) {
      return sendResponse(res, 400, { success: false, message: 'Page name is required.' });
    }

    // Build target folder: source/ui/pages/<PageName>
    const pageFolder = path.join(__dirname, "../", "../", 'source', 'ui', 'pages');

    // Write page.json with formatted JSON
    let fn = page.name + ".json";
    fs.writeFile(path.join(pageFolder, fn), JSON.stringify(page, null, 2), err2 => {
      if (err2) {
        console.error('Error writing ' + fn, err2);
        return sendResponse(res, 500, { success: false, message: 'Error writing ' + fn, error: err2 });
      }

      return sendResponse(res, 200, { success: true, message: fn + ' saved successfully.' });
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