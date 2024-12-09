#! /usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const url = 'https://vvskchaitanya.github.io/fullstack.js/main.js';
const file = "main.js";

// Function to fetch, save, execute, and clean up the JavaScript file
function fetchAndExecuteJS() {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, file);
        console.log(filePath);

        // Fetch the file from the URL
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch file. Status code: ${res.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();

                try {

                    // Execute the downloaded file using execSync
                    execSync(`node ${filePath}`, { stdio: 'inherit' });
                    resolve('Thanks for using @vvsk/fullstack');

                } catch (error) {

                    reject(new Error(`Error executing file: ${error.message}`));

                } finally {
                    // Delete the file regardless of success or error
                    fs.unlink(filePath, (unlinkError) => {
                        if (unlinkError) {
                            console.error(`Error deleting file: ${unlinkError.message}`);
                        } 
                    });
                }
            });

            fileStream.on('error', (error) => {
                // Ensure file is deleted if writing fails
                reject(new Error(`Error saving file: ${error.message}`));
                fs.unlink(filePath, (unlinkError) => {
                    if (unlinkError) {
                        console.error(`Error deleting file after save failure: ${unlinkError.message}`);
                    }
                });
            });
        }).on('error', (error) => {
            reject(new Error(`Error fetching file: ${error.message}`));
        });
    });
}

fetchAndExecuteJS()
    .then((message) => console.log(message))
    .catch((error) => console.error(error.message));
