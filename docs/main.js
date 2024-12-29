const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const readline = require('node:readline');
const {execSync,spawn} = require("child_process");

/**
 * Fetch a file using http or https.
 * @param {string} url - The URL of the file to fetch.
 * @returns {Promise<Buffer>} - The file data as a Buffer.
 */
function fetchFile(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
                return;
            }
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
    });
}

/**
 * Ensures that the directory structure exists for a given file path.
 * @param {string} filePath - The file path for which to ensure directory structure.
 */
function ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Fetch and save files while recreating folder structure locally.
 * @param {string} baseUrl - The base URL for fetching files.
 * @param {string[]} filePaths - Array of file paths to fetch.
 * @param {string} outputDir - Local directory to save files.
 */
async function fetchAndSaveFiles(baseUrl, filePaths, outputDir) {
    for (const filePath of filePaths) {
        const fullUrl = `${baseUrl}/${filePath}`;
        const localPath = path.join(outputDir, filePath);

        try {
            const fileData = await fetchFile(fullUrl);

            ensureDirectoryExists(localPath);
            fs.writeFileSync(localPath, fileData);
            console.log(`Created: ${localPath}`);
        } catch (error) {
            console.error(`Failed to fetch and create file: ${filePath}`, error.message);
        }
    }
}

const baseUrl = 'https://vvskchaitanya.github.io/fullstack.js/app'; 
var files = [
    'package.json',
    'index.js',
    'ui/index.html',
    'ui/script.js',
    'ui/style.css',
    'ui/pages/home/template.html',
    'ui/pages/home/script.js',
    'ui/pages/home/style.css',
    'ui/shared/loader.js',
    'ui/shared/logger.js'
];


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Fullstack App Name: ", (name) => {
  name = name.toLowerCase().replace(" ","-");
  console.log("Creating Fullstack App: "+name);
  fs.mkdirSync(name);
  fetchAndSaveFiles(baseUrl, files, name)
  .then(()=>{
    console.log('Created Fullstack App: '+name);
    process.chdir(name);
    execSync(
      "npm run fetch",
      {stdio: 'inherit'}
    );
    const child = spawn('npm', ['start'], { stdio: 'inherit' });

    child.on('exit', (code) => {
        console.log(`Process exited with code ${code}`);
    });
    rl.close();
  })
  .catch((err)=>{
    console.error('Failed to create app '+name, err);
    rl.close();
  });
});
