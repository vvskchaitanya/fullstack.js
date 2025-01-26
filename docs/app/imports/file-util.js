const fs = require('fs');
const path = require('path');

/**
 * Recursively copy files and directories.
 * @param {string} src - The source directory.
 * @param {string} dest - The destination directory.
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source folder "${src}" does not exist.`);
    return;
  }

  // Ensure destination directory exists
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read contents of the source directory
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      // If it's a directory, call the function recursively
      copyRecursive(srcPath, destPath);
    } else {
      // If it's a file, copy it
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = { copyRecursive };
