const fs = require("fs");
const { copyRecursive } = require('./file-util');


const SOURCE_UI_RESOURCES = "source/ui/resources";
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
    "shared"
]

build = function(){
    /** Delete and Create output folder */
    if (fs.existsSync(OUTPUT)) {
        fs.rmSync(OUTPUT, { recursive: true });
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

    /** Copy the source resources to output */
    copyRecursive(SOURCE_UI_RESOURCES,OUTPUT);
}



module.exports = { build };