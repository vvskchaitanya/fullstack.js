const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // Ensure the request is a POST method
    if (req.method !== 'POST') {
        res.statusCode = 405; // Method Not Allowed
        res.end('Only POST requests are allowed.');
        return;
    }

    // Collect request body data
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            // Parse the JSON body
            const data = JSON.parse(body);

            // Validate the required fields
            const { name, template, script, style } = data;
            if (!name || !template || !script || !style) {
                res.statusCode = 400; // Bad Request
                res.end('Error: Missing required fields (name, template, script, style).');
                return;
            }

            // Define the directory for the pages
            const pagesDir = path.join(__dirname, '..', 'pages', name);
            if (!fs.existsSync(pagesDir)) {
                fs.mkdirSync(pagesDir, { recursive: true });
            }

            // Save data to respective files
            fs.writeFileSync(path.join(pagesDir, 'template.html'), template);
            fs.writeFileSync(path.join(pagesDir, 'script.js'), script);
            fs.writeFileSync(path.join(pagesDir, 'style.css'), style);

            // Send success response
            res.statusCode = 200;
            res.end(`Page saved successfully in folder: ${name}`);
        } catch (error) {
            res.statusCode = 400; // Bad Request
            res.end(`Error processing request: ${error.message}`);
        }
    });

    req.on('error', error => {
        res.statusCode = 500; // Internal Server Error
        res.end(`Error receiving request: ${error.message}`);
    });
};
