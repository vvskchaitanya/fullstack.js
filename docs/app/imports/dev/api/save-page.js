const fs = require('fs');
const path = require('path');

// POST body => { name, path?, template, script, style }
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

    // Target folder: docs/app/source/ui/pages/<pageName>
    const pagesRoot = path.join(__dirname, '..', '..', '..', 'source', 'ui', 'pages');

    // Basic sanitization to avoid path traversal and weird characters
    const safeName = String(page.name).replace(/[^a-zA-Z0-9_-]/g, '-');
    const pageDir = path.join(pagesRoot, safeName);

    const template = page.template || page.html || '';
    const script = page.script || '';
    const style = page.style || '';

    const fsp = fs.promises;

    (async () => {
      try {
        await fsp.mkdir(pageDir, { recursive: true });

        // Write the three main assets
        await Promise.all([
          fsp.writeFile(path.join(pageDir, 'index.html'), template, 'utf8'),
          fsp.writeFile(path.join(pageDir, 'script.js'), script, 'utf8'),
          fsp.writeFile(path.join(pageDir, 'style.css'), style, 'utf8')
        ]);

        // Optional: write a small metadata file for tooling
        const meta = { name: page.name, path: page.path || '/' + safeName };
        await fsp.writeFile(path.join(pageDir, 'page.json'), JSON.stringify(meta, null, 2), 'utf8');

        return sendResponse(res, 200, { success: true, message: 'Page files saved.', files: ['index.html', 'script.js', 'style.css'] });
      } catch (err) {
        console.error('Error saving page files:', err);
        return sendResponse(res, 500, { success: false, message: 'Error saving page files', error: String(err) });
      }
    })();
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