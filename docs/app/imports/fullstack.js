var compiler = require('./compiler');
var server = require('./server');
var builder = require('./builder');

// global variables
const algorithm = "aes256";
const options = { encoding: "UTF-8" };

const timestamp = function(){
    return new Date().toUTCString();
}

start = function(){
    compiler.compile();
    compiler.develop();
    server.serve();
    console.log("Fullstack App Stared.");
}

build = function(){
    compiler.compile();
    builder.build();
    compiler.clean();
    console.log("Build Successfull")
}

// Handle server shutdown
function handleShutdown() {
    console.log("\nFullstack App Stopped.")
    compiler.clean();
    process.exit(0);
}

// Listen for termination signals
process.on('SIGINT', handleShutdown); // Ctrl+C
process.on('SIGTERM', handleShutdown); // Termination signal

// Optional: Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  handleShutdown();
});


module.exports = { start, build };
