const { build } = require("@opennextjs/cloudflare/dist/cli/build/build.js");
const { findPackagerAndRoot, getNextVersion, checkRunningInsideNextjsApp, findOpenNextConfig, getOptions } = require("@opennextjs/aws/build/helper.js");
const path = require("path");
const fs = require("fs");

async function main() {
  const appPath = process.cwd();
  console.log("App path:", appPath);
  
  // Build options the way the CLI does
  const { packager, root: monorepoRoot } = findPackagerAndRoot(appPath);
  console.log("Packager:", packager);
  
  const nextVersion = getNextVersion(appPath);
  console.log("Next.js version:", nextVersion);
  
  const config = findOpenNextConfig(appPath);
  console.log("OpenNext config found:", !!config);
  
  const options = getOptions({
    appPath,
    packager,
    monorepoRoot,
    nextVersion,
    config,
    skipNextBuild: true,
    minify: false,
    outputDir: path.join(appPath, ".open-next"),
    buildDir: path.join(appPath, ".open-next", ".build"), 
  });
  
  console.log("Options:", JSON.stringify({
    appPath: options.appPath,
    outputDir: options.outputDir,
    buildDir: options.buildDir,
    skipNextBuild: options.skipNextBuild,
  }, null, 2));
  
  try {
    await build(options, config, { skipNextBuild: true }, { compatibility_date: "2025-09-01" }, false);
    console.log("Build complete!");
  } catch (e) {
    console.error("Build error:", e.message);
    console.error("Stack:", e.stack?.substring(0, 500));
  }
}

main().catch(e => console.error("Fatal:", e));
