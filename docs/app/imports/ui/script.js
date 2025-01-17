// Fetch the bundle.json and initialize the pages array
let pages = [];

fetch('ui/bundle.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        pages = data.pages;
        console.log('Pages loaded:', pages);
    })
    .catch(error => {
        console.error('Failed to fetch bundle.json:', error);
    });

// Function to load a page based on the path
function goto(path) {
    const page = pages.find(p => p.name === path);
    var app = document.getElementById('app');
    if (!page) {
        app.innerHTML = '<h1>Page Not Found</h1>';
        return;
    }
    else {
        app.innerHTML = page.template;
        // Dynamically load the script
        if (page.script) {
             const script = document.createElement('script');
             script.innerHTML = page.script;
             script.type = 'text/javascript';
             script.onload = () => console.log(`${page.script} loaded.`);
             app.appendChild(script);
        }

       // Dynamically load the style
       if (page.style) {
             const style = document.createElement('link');
             style.rel = 'stylesheet';
             style.innerHTML = page.style;
             app.appendChild(style);
       }
    }
}

Loader.init();

// Example usage after pages are loaded
setTimeout(() => {
    goto('home');
}, 1000);
