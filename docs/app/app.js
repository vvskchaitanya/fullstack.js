const {app, BrowserWindow} = require('electron') // http://electronjs.org/docs/api
const path = require('path') // https://nodejs.org/api/path.html
const url = require('url') // https://nodejs.org/api/url.html

app.once('ready', () => {
    // Create a new window
    window = new BrowserWindow({
      backgroundColor: '#2e2c29',
      // Set the initial width to 600px
      width: 600,
      // Set the initial height to 500px
      height: 500,
      // Don't show the window until it ready, this prevents any white flickering
      show: false,
      // Don't allow the window to be resized.
      resizable: true,
      fullscreenable : true
    })
  
    // Load a URL in the window to the local index.html path
    window.loadURL(url.format({
      pathname: path.join(__dirname, 'docs/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  
    // Show window when page is ready
    window.once('ready-to-show', () => {
      window.show()
    })
  });