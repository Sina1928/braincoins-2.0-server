const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Build the server
console.log("Building server...");
execSync("npm run build", { stdio: "inherit" });

// Create dist directory if it doesn't exist
const distPath = path.join(__dirname, "dist");
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

// Copy static files if needed
const publicPath = path.join(__dirname, "public");
if (fs.existsSync(publicPath)) {
  execSync(`cp -r ${publicPath}/* ${distPath}/`);
}

console.log("Build completed successfully!");
