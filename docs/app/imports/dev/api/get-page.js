const fs = require('fs');
const path = require('path');

// Returns a list of pages under source/ui/pages
const { parse: parseUrl } = require('url');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(204);
    return res.end();
  }

  try {
    // Check query params for ?contents=true
    const parsed = parseUrl(req.url || '', true);
    const includeContents = parsed.query && String(parsed.query.contents) === 'true';
    const pagesRoot = path.join(__dirname, '..', '..', '..', 'source', 'ui', 'pages');
    const entries = await fs.promises.readdir(pagesRoot, { withFileTypes: true });

    const pages = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      const pageDir = path.join(pagesRoot, name);

      // Check for known assets
      const htmlPath = path.join(pageDir, 'index.html');
      const scriptPath = path.join(pageDir, 'script.js');
      const stylePath = path.join(pageDir, 'style.css');
      const metaPath = path.join(pageDir, 'page.json');

      const exists = await Promise.all([
        existsAsync(htmlPath),
        existsAsync(scriptPath),
        existsAsync(stylePath),
        existsAsync(metaPath)
      ]);

      let meta = null;
      if (exists[3]) {
        try {
          const raw = await fs.promises.readFile(metaPath, 'utf8');
          meta = JSON.parse(raw);
        } catch (e) {
          // ignore parse errors
          meta = null;
        }
      }

      const pageObj = {
        name,
        path: (meta && meta.path) ? meta.path : '/' + name,
        files: {
          html: exists[0],
          script: exists[1],
          style: exists[2]
        }
      };

      if (includeContents) {
        // Read file contents when requested
        if (exists[0]) {
          try { pageObj.template = await fs.promises.readFile(htmlPath, 'utf8'); } catch (e) { pageObj.template = ''; }
        }
        if (exists[1]) {
          try { pageObj.script = await fs.promises.readFile(scriptPath, 'utf8'); } catch (e) { pageObj.script = ''; }
        }
        if (exists[2]) {
          try { pageObj.style = await fs.promises.readFile(stylePath, 'utf8'); } catch (e) { pageObj.style = ''; }
        }
      }

      pages.push(pageObj);
    }

    return sendResponse(res, 200, { success: true, pages });
  } catch (err) {
    console.error('Error listing pages:', err);
    return sendResponse(res, 500, { success: false, message: 'Error listing pages', error: String(err) });
  }
};

function sendResponse(res, statusCode, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function existsAsync(p) {
  try {
    await fs.promises.access(p, fs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}
