const fs = require("fs");
const options = { encoding: "UTF-8" };

const UI_PAGES = "ui/pages";

var watch = [];

compile = function(){
    if(!fs.existsSync(UI_PAGES)){
        console.log("Compiler: No Directory \""+UI_PAGES+"\"");
        return;
    }
    var pages = fs.readdirSync(UI_PAGES);
    var bundle = { pages:[], components:[]};
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
        bundle.pages.push(p);
    });
    if(watch.length==0){
        watch = files;
        watcher();
    }
    fs.writeFileSync("ui/bundle.json",JSON.stringify(bundle));
}

watcher=function(){
    watch.forEach(path=>{
        console.log(path);
        fs.watch(path, (event,file)=>{
            compile();
        });
    });
}

module.exports = { compile };