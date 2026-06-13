// Fetch the bundle.json and initialize the pages array
let components = [];

fetch('bundle.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        components = data.components;
        console.log('Components loaded:', components);
        load();
    })
    .catch(error => {
        console.error('Failed to fetch bundle.json:', error);
    });

Loader.init();
Logger.init();
Pages.init();
//Firebase.init();

load=function(){
    Pages.go(window.location.pathname.substring(1));
}
