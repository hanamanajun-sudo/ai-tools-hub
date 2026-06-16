import { build } from "@opennextjs/cloudflare/dist/cli/build/build.js";
import { findPackagerAndRoot, getNextVersion, checkRunningInsideNextjsApp, findOpenNextConfig, getOptions } from "@opennextjs/aws/build/helper.js";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = process.cwd();

console.log("App path:", appPath);

const { packager, root: monorepoRoot } = findPackagerAndRoot(appPath);
console.log("Packager:", packager);

const nextVersion = getNextVersion(appPath);
console.log("Next.js version:", nextVersion);

const config = findOpenNextConfig(appPath);
console.log("OpenNext config found:", !!config);

const wranglerConfig = { compatibility_date: "2025-09-01" };

const options = getOptions({
  appPath,
  packager,
  monorepoRoot,
  nextVersion,
  config,
  skipNextBuild: true,
  minify: false,
  outputDir: path.join(appPath, ".open-next"),
});

console.log("Output dir:", options.outputDir);
console.log("Skip next build:", options.skipNextBuild);

try {
  await build(options, config, { skipNextBuild: true }, wranglerConfig, false);
  console.log("\n=== BUILD COMPLETE ===");
  // List output
  const files = fs.readdirSync(options.outputDir, { recursive: true });
  for (const f of files) console.log("  ", f);
} catch (e) {
  console.error("\nBuild error:", e?.message || e);
  if (e?.stack) console.error("Stack:", e.stack.substring(0, 1000));
}
