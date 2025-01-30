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
    'app.js',
    'imports/file-util.js',
    'imports/server.js',
    'imports/compiler.js',
    'imports/builder.js',
    'imports/fullstack.js',
    'imports/ui/shared/loader.js',
    'imports/ui/shared/logger.js',
    'imports/ui/shared/firebase.js'
];

var new_f=[
    'imports/ui/index.html',
    'imports/ui/script.js',
    'imports/ui/style.css',
    'imports/ui/404.html',
    'imports/ui/fireabse-config.json',
    'imports/ui/shared/icon.png',
    'source/ui/components/header/header.html',
    'source/ui/components/header/header.css',
    'source/ui/components/home/home.html',
    'source/ui/components/home/home.css',
    'source/ui/pages/home.json',
]


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Fullstack App Name: ", (name) => {
  name = name.toLowerCase().replace(" ","-");
  // Get the current directory name
  const currentDirName = path.basename(process.cwd());
    if (name == currentDirName) {
        // Create /Update app in same directory
        name = "";
    }
  var is_new_app = !fs.existsSync(name+"/package.json");
  var action = is_new_app?"Creat":"Updat";
  console.log(action+"ing Fullstack App: "+name);
  if(is_new_app){
    if(name!=""){
        console.log("Creating folder: "+name);
        fs.mkdirSync(name, {recursive: true});
    }
    files = files.concat(new_f);
  }
  fetchAndSaveFiles(baseUrl, files, name)
  .then(()=>{
    console.log(action+'ed Fullstack App: '+name);
    if(name!=""){
        process.chdir(name);
    }
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
