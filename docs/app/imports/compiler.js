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

    /** Convert source/pages into target/bundle.json */
    bundle();
}

bundle=function(){
    var bundle_output = { pages:[],components:[]};
    var UI_COMPONENTS = SOURCE+UI+COMPONENTS;
    var UI_PAGES = SOURCE+UI+PAGES;
    var files = [];
    if(!fs.existsSync(UI_COMPONENTS)){
        console.log("Compiler: No Directory \""+UI_COMPONENTS+"\"");
    }else{
        var components = fs.readdirSync(UI_COMPONENTS);
        components.forEach(component =>{
            var c = {};
            c.name = component;
            console.log("Compiler: Adding Component: "+component);
            var template = UI_COMPONENTS +"/"+ component + "/"+component+".html";
            var script = UI_COMPONENTS +"/"+ component + "/"+component+".js";
            var style = UI_COMPONENTS +"/"+ component + "/"+component+".css";
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
        var pages = fs.readdirSync(UI_PAGES);
        pages.forEach(page =>{
            console.log("Compiler: Adding Page: "+page);
            var pf = UI_PAGES +"/"+page;
            var p = fs.existsSync(pf)?fs.readFileSync(pf, options):"";
            if(p!=""){
                files.push(pf);
                p=JSON.parse(p);
                bundle_output.pages.push(p);    
            }
        });
    }
    
    /** Watch source file changes and recompile into bundle.json */
    if(watch.length==0 && files!=null && files.length!=0){
        watch = files;
        watcher();
    }
    fs.writeFileSync(TARGET+UI+"/bundle.json",JSON.stringify(bundle_output));
}

watcher=function(){
    watch.forEach(path=>{
        fs.watch(path, (event,file)=>{
            bundle();
        });
    });
}

develop = function(){
    if(fs.existsSync("imports/dev/ui/develop")){
        copyRecursive("imports/dev/ui/develop","target/ui/develop");
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
