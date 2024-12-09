const fs = require('fs');
const readline = require('node:readline');
const {execSync, spawn} = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Application Name: ", name => {
  name = name.toLowerCase().replace(" ","-");
  console.log("Creating Fullstack Application "+name);
  fs.mkdirSync(name);
  process.chdir(name);
  execSync(
    "npm init",
    {stdio: 'inherit'}
  );
  rl.close();
});
