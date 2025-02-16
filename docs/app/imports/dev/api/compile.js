var compiler = require('../../imports/compiler');

module.exports = (req, res) => {
    compiler.compile();
    compiler.develop();

    sendResponse(res,200,"");
}

// Helper function to send JSON responses with CORS headers
function sendResponse(res, statusCode, data) {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
