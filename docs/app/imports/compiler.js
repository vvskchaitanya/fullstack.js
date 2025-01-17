const fs = require("fs");
const { copyRecursive } = require('./file-util');


const options = { encoding: "UTF-8" };
const IMPORTS = "imports/"
const SOURCE = "source/";
const UI = "ui/"
const PAGES="pages/"
const RESOURCES = "resources/"
const TARGET = "target/";

var watch = [];

compile = function(){
    /** Create TARGET */
    if (!fs.existsSync(TARGET)) {
        fs.mkdirSync(TARGET, { recursive: true });
    }

    /** Copy complete imports/ui into target/ */
    copyRecursive(IMPORTS+UI,TARGET);

    /** Copy complete source/resources into target */
    copyRecursive(SOURCE+RESOURCES,TARGET);

    /** Convert source/pages into target/bundle.json */
    bundle();
}

bundle=function(){
    var UI_PAGES = SOURCE+UI+PAGES;
    if(!fs.existsSync(UI_PAGES)){
        console.log("Compiler: No Directory \""+UI_PAGES+"\"");
        return;
    }
    var pages = fs.readdirSync(UI_PAGES);
    var bundle_output = { pages:[]};
    var files = [];
    pages.forEach(page =>{
        var p = {};
        p.name = page;
        console.log("Compiler: Adding Page: "+page);
        var template = UI_PAGES +"/"+ page + "/template.html";
        var script = UI_PAGES +"/"+ page + "/script.js";
        var style = UI_PAGES +"/"+ page + "/style.css";
        var data = UI_PAGES +"/"+ page + "/data.json";
        p.template = fs.existsSync(template)?fs.readFileSync(template, options):"";
        p.script = fs.existsSync(script)?fs.readFileSync(script, options):"";
        p.style = fs.existsSync(style)?fs.readFileSync(style, options):"";
        p.data = fs.existsSync(data)?fs.readFileSync(data, options):"";
        [template,script,style,data].forEach(f=>{
            fs.existsSync(f)?files.push(f):"";
        });
        bundle_output.pages.push(p);
    });
    /** Watch source file changes and recompile into bundle.json */
    if(watch.length==0 && files.length!=0){
        watch = files;
        watcher();
    }
    fs.writeFileSync(TARGET+"/bundle.json",JSON.stringify(bundle_output));
}

watcher=function(){
    watch.forEach(path=>{
        console.log(path);
        fs.watch(path, (event,file)=>{
            bundle();
        });
    });
}
  
module.exports = { compile };