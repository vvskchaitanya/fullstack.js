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

    if (!page) {
        document.getElementById('app').innerHTML = '<h1>Page Not Found</h1>';
        return;
    }

    // Fetch and load the template
    fetch(page.template)
        .then(response => response.text())
        .then(template => {
            document.getElementById('app').innerHTML = template;

            // Dynamically load the script
            if (page.script) {
                const script = document.createElement('script');
                script.src = page.script;
                script.type = 'text/javascript';
                script.onload = () => console.log(`${page.script} loaded.`);
                document.body.appendChild(script);
            }

            // Dynamically load the style
            if (page.style) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = page.style;
                document.head.appendChild(link);
            }
        })
        .catch(error => {
            console.error('Failed to load page template:', error);
            document.getElementById('app').innerHTML = '<h1>Error loading page</h1>';
        });
}

// Example usage after pages are loaded
setTimeout(() => {
    goto('home'); // Replace '/example' with the desired path
}, 1000); // Simulating a delay for pages to load