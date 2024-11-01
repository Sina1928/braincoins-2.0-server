// build.js
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

// Build the server
console.log("Building server...");
execSync("npm run build", { stdio: "inherit" });

// Create dist directory if it doesn't exist
const distPath = path.join(process.cwd(), "dist"); // Use process.cwd() to get the current working directory
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

// Copy static files if needed
const publicPath = path.join(process.cwd(), "public");
if (fs.existsSync(publicPath)) {
  execSync(`cp -r ${publicPath}/* ${distPath}/`);
}

console.log("Build completed successfully!");
