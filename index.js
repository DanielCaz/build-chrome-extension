#!/usr/bin/env node

import { execSync } from "child_process";

const build = async () => {
  console.time("Build time");
  try {
    const skipMinify = process.argv.includes("--skip-minify");

    console.log("Cleaning up previous build...\n");
    execSync("rm -rf dist");
    execSync("mkdir dist");

    console.log("Compiling TypeScript...\n");
    execSync("tsc");

    console.log("Copying files...");
    execSync("cp -r src/icons src/manifest.json src/popup.html dist/");
    console.log("");

    console.log("Compiling tailwindcss...");
    execSync(
      `npx tailwindcss -i ./src/styles/tailwind.css -o ./dist/styles/tailwind.css ${
        skipMinify ? "" : "--minify"
      }`
    );
    console.log("");

    if (!skipMinify) {
      console.log("Minifying JS...\n");
      let jsFiles = getFilesByExtention("./dist", "js");
      for (let file of jsFiles) {
        execSync(`npx uglify-js ${file} -o ${file} --compress --mangle`);
      }

      console.log("Minifying HTML...\n");
      let htmlFiles = getFilesByExtention("./dist", "html");
      for (let file of htmlFiles) {
        execSync(`npx html-minifier --collapse-whitespace ${file} -o ${file}`);
      }
    }

    console.log("Build completed successfully!\n");
  } catch (error) {
    console.error("Error during build:", error.message, "\n");
  }

  console.timeEnd("Build time");
};

build();

function getFilesByExtention(dir, ext) {
  let files = execSync(`find ${dir} -name '*.${ext}'`);
  files = files.toString().split("\n");
  files = files.filter((file) => file !== "");
  return files;
}
