const fs = require('fs');
const path = require('path');

// DELETE handler for pages. Expects POST JSON: { name }
module.exports = (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(204);
    return res.end();
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(body || '{}');
    } catch (e) {
      return sendResponse(res, 400, { success: false, message: 'Invalid JSON' });
    }

    const { name } = data;
    if (!name) {
      return sendResponse(res, 400, { success: false, message: 'Page name is required.' });
    }

    // Compute pages root and sanitized name (same strategy as save-page)
    const pagesRoot = path.join(__dirname, '..', '..', '..', 'source', 'ui', 'pages');
    const safeName = String(name).replace(/[^a-zA-Z0-9_-]/g, '-');
    const pageDir = path.join(pagesRoot, safeName);

    try {
      // Check existence
      if (!fs.existsSync(pageDir)) {
        return sendResponse(res, 404, { success: false, message: 'Page not found.' });
      }

      const fsp = fs.promises;

      // Prefer fs.promises.rm if available (Node 14.14+); otherwise fallback to recursive removal
      if (typeof fsp.rm === 'function') {
        await fsp.rm(pageDir, { recursive: true, force: true });
      } else {
        // Fallback recursive delete
        await removeFolderRecursive(pageDir);
      }

      return sendResponse(res, 200, { success: true, message: 'Page deleted successfully.' });
    } catch (err) {
      console.error('Error deleting page:', err);
      return sendResponse(res, 500, { success: false, message: 'Error deleting page.', error: String(err) });
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

// Fallback recursive folder removal using promises
async function removeFolderRecursive(folderPath) {
  const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      await removeFolderRecursive(fullPath);
    } else {
      await fs.promises.unlink(fullPath);
    }
  }));
  await fs.promises.rmdir(folderPath);
}