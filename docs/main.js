const fs = require('fs');
const readline = require('node:readline');
const {execSync} = require("child_process");
const https = require('https');
const http = require('http');
const path = require('path');

/**
 * Fetches content from a URL and saves it as a file locally.
 * @param {string} url - The URL to fetch.
 * @param {string} outputDir - The directory to save the files.
 */
function fetchAndSaveFile(url, outputDir) {
  return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const fileName = path.basename(url.split('?')[0]) || 'invalid';
      const filePath = path.join(outputDir, fileName);
      if(fileName=="invalid") return;
      
      protocol.get(url, (res) => {
          if (res.statusCode !== 200) {
              reject(new Error(`Failed to fetch ${url}. Status code: ${res.statusCode}`));
              return;
          }

          const fileStream = fs.createWriteStream(filePath);
          res.pipe(fileStream);

          fileStream.on('finish', () => {
              fileStream.close();
              resolve(`Created File: ${filePath}`);
          });

          fileStream.on('error', (error) => {
              reject(new Error(`Error creating file ${filePath}: ${error.message}`));
          });
      }).on('error', (error) => {
          reject(new Error(`Error fetching ${url}: ${error.message}`));
      });
  });
}

var files = [
  "https://vvskchaitanya.github.io/fullstack.js/app/package.json",
  "https://vvskchaitanya.github.io/fullstack.js/app/index.js"
]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Application Name: ", async (name) => {
  name = name.toLowerCase().replace(" ","-");
  console.log("Creating Fullstack Application "+name);
  fs.mkdirSync(name);
  for (const url of files) {
    try {
        const message = await fetchAndSaveFile(url, name);
        console.log(message);
    } catch (error) {
        console.error(error.message);
    }
}
  process.chdir(name);
  execSync(
    "npm install && npm start",
    {stdio: 'inherit'}
  );
  rl.close();
});
