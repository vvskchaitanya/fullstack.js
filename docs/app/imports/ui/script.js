// Fetch the bundle.json and initialize the pages array
let pages = [];
let components = [];

fetch('ui/bundle.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        pages = data.pages;
        components = data.components;
        console.log('Pages loaded:', pages);
        console.log('Components loaded:', components);
        load();
    })
    .catch(error => {
        console.error('Failed to fetch bundle.json:', error);
    });

// Function to load a page based on the path
function goto(path) {
    console.log("Goto: "+path)
    const page = pages.find(p => p.path === path);
    var app = document.getElementById('app');
    app.innerHTML = "";
    if (!page) {
        app.innerHTML = '<h1>Page Not Found</h1>';
        return;
    }
    else {
        const p = document.createElement("div");
        p.id = page.name;
        if(page.title!=undefined){
            document.title = page.title;
        }
        for(var comp of page.components){
            var c = document.createElement("div");            
            var component = components.find(c=>c.name==comp);
            if(component!=undefined){
                c.id = component.name;
                if(component.template!=undefined){
                    c.innerHTML = component.template;
                }
                // Dynamically load the script
                if(component.script!=undefined){
                    var script = document.createElement('script');
                    script.innerHTML = component.script;
                    script.type = 'text/javascript';
                    c.appendChild(script);
                }
                // Dynamically load the style
                if (component.style) {
                    var style = document.createElement('link');
                    style.rel = 'stylesheet';
                    style.innerHTML = component.style;
                    c.appendChild(style);
                }
                
            }
            p.appendChild(c);  
        }
        app.appendChild(p);
    }
}

Loader.init();
Logger.init();
Firebase.init();

load=function(){
    goto(window.location.pathname.substring(1));
}


