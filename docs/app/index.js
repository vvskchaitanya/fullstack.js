const app = require("./imports/fullstack");

const args = process.argv.slice(2); 

args.includes('--build')? app.build() : app.start();
