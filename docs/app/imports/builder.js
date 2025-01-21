const fs = require("fs");
const { copyRecursive } = require('./file-util');

const TARGET_UI = "target/ui/";
const OUTPUT = "docs/"

var include_files = [
    "index.html",
    "script.js",
    "style.css",
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
        copyRecursive(TARGET_UI+f,OUTPUT+f)
    })
}

module.exports = { build };