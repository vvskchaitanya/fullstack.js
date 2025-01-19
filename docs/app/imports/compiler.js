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
    /** Create TARGET */
    if (!fs.existsSync(TARGET)) {
        fs.mkdirSync(TARGET+UI, { recursive: true });
    }

    /** Copy complete imports/ui into target/ */
    copyRecursive(IMPORTS+UI,TARGET+UI);

    /** Copy complete source/resources into target */
    copyRecursive(SOURCE+RESOURCES,TARGET+UI);

    /** Convert source/pages into target/bundle.json */
    bundle();
}

bundle=function(){
    var bundle_output = { pages:[],components:[]};
    var UI_COMPONENTS = SOURCE+UI+COMPONENTS;
    var UI_PAGES = SOURCE+UI+PAGES;
    if(!fs.existsSync(UI_COMPONENTS)){
        console.log("Compiler: No Directory \""+UI_COMPONENTS+"\"");
    }else{
        var components = fs.readdirSync(UI_COMPONENTS);
        var files = [];
        components.forEach(component =>{
            var c = {};
            c.name = component;
            console.log("Compiler: Adding Component: "+component);
            var template = UI_PAGES +"/"+ component + "/"+component+".html";
            var script = UI_PAGES +"/"+ component + "/"+component+".js";
            var style = UI_PAGES +"/"+ component + "/"+component+".css";
            c.template = fs.existsSync(template)?fs.readFileSync(template, options):"";
            c.script = fs.existsSync(script)?fs.readFileSync(script, options):"";
            c.style = fs.existsSync(style)?fs.readFileSync(style, options):"";
            [template,script,style].forEach(f=>{
                fs.existsSync(f)?files.push(f):"";
            });
            bundle_output.components.push(c);
        });
    }

    if(!fs.existsSync(UI_PAGES)){
        console.log("Compiler: No Directory \""+UI_PAGES+"\"");
    }else{
        var pages = fs.readFileSync(UI_PAGES);
        var files = [];
        pages.forEach(page =>{
            console.log("Compiler: Adding Page: "+page);
            var pf = UI_PAGES +"/"+page;
            var p = fs.existsSync(pf)?fs.readFileSync(pf, options):"";
            if(pf!=""){
                files.push(pf)
                bundle_output.pages.push(p);    
            }
        });
    }
    
    /** Watch source file changes and recompile into bundle.json */
    if(watch.length==0 && files.length!=0){
        watch = files;
        watcher();
    }
    fs.writeFileSync(TARGET+UI+"/bundle.json",JSON.stringify(bundle_output));
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