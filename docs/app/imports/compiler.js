const fs = require("fs");
const { copyRecursive } = require('./file-util');


const options = { encoding: "UTF-8" };
const IMPORTS = "imports/"
const SOURCE = "source/";
const UI = "ui/"
const COMPONENTS="components/"
const PAGES="pages/"
const RESOURCES = "resources/"
const TARGET = "target/";

var watch = [];

compile = function(){

    /** Delete TARGET */
    clean();

    /* Create Target */
    fs.mkdirSync(TARGET+UI, { recursive: true });

    /** Copy complete imports/ui into target/ui */
    copyRecursive(IMPORTS+UI,TARGET+UI);

    /** Copy complete source/ui into target/ui */
    copyRecursive(SOURCE+UI,TARGET+UI);
}

watcher=function(){
    watch.forEach(path=>{
        fs.watch(path, (event,file)=>{
            /** Copy complete source/ui into target/ui */
            copyRecursive(SOURCE+UI,TARGET+UI);
        });
    });
}

develop = function(){
    if(fs.existsSync("imports/dev/ui/develop")){
        copyRecursive("imports/dev/ui/develop","target/ui/pages/develop");
    }
    if(fs.existsSync("imports/dev/api")){
        copyRecursive("imports/dev/api","target/api/");
    }
}

clean = function(){
    if (fs.existsSync(TARGET)) {
        fs.rmSync(TARGET,{recursive: true});
    }
}
  
module.exports = { compile, develop, clean };
