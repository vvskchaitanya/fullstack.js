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

      const { name } = data;
      if (!name) {
        return sendResponse(res, 400, { success: false, message: 'Component name is required.' });
      }

      // Define component folder path
      const pageFile = path.join(__dirname, "../","../",'source', 'ui', 'pages', name+".json");

      // Check if component exists before attempting to delete
      if (!fs.existsSync(pageFile)) {
        return sendResponse(res, 404, { success: false, message: 'Component not found.' });
      }

      try {
        fs.rmSync(pageFile);
        return sendResponse(res, 200, { success: true, message: 'Component deleted successfully.' });
      } catch (err) {
        console.error('Error deleting component:', err);
        return sendResponse(res, 500, { success: false, message: 'Error deleting component.', error: err });
      }
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

// Function to delete a folder recursively
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach((file) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath); // Recursively delete subdirectories
        } else {
          fs.unlinkSync(curPath); // Delete files
        }
      });
      fs.rmdirSync(folderPath); // Delete the now-empty folder
    }
  }