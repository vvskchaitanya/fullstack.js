const fs = require("fs");
const { copyRecursive } = require('./file-util');

const TARGET_UI = "target/ui/";
const OUTPUT = "docs/"

var include_files = [
    "index.html",
    "script.js",
    "style.css",
    "404.html",
    "bundle.json"
];

var include_folders = [
    "shared",
    "resources"
]

build = function(){
    /** Delete and Create output folder */
    if (fs.existsSync(OUTPUT)) {
        fs.rmdirSync(OUTPUT, { recursive: true });
    }
    fs.mkdirSync(OUTPUT, { recursive: true });

    /** Copy included files from target to output folder */
    include_files.forEach(f=>{
        fs.copyFileSync(TARGET_UI+f,OUTPUT+f);
    });

    /** Copy included folders from target to output */
    include_folders.forEach(f=>{
        copyRecursive(TARGET_UI+f,OUTPUT+f);
    });

    /** Copy the extra files included in build.json */
    var ex_files = getFilesFromBuildJsonSync("build.json");
    ex_files.forEach(f=>{
        fs.copyFileSync(TARGET_UI+f,OUTPUT+f);
    });
}

/**
 * Reads the build.json file and returns the files array synchronously.
 * @param {string} filePath - Path to the build.json file.
 * @returns {string[]} - The files array from the build.json file.
 */
function getFilesFromBuildJsonSync(filePath) {
    if(fs.existsSync("build.json")){
        try {
            // Read the file synchronously
            const data = fs.readFileSync(filePath, 'utf8');
            // Parse the JSON data
            const buildJson = JSON.parse(data);
    
            // Extract the files array
            if (!Array.isArray(buildJson.files)) {
                throw new Error("'files' property is missing or not an array in build.json");
            }
    
            return buildJson.files;
        } catch (error) {
            console.error(`Error reading or parsing build.json: ${error.message}`);
        }
    }
    return [];
}

module.exports = { build };