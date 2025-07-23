#!/usr/bin/env node

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { Command } from "commander";

const execAsync = promisify(exec);
const appPath = path.resolve(process.cwd(), "src", "App.tsx");

const log = (msg) => console.log(`\x1b[36m[fix]\x1b[0m ${msg}`);
const errorLog = (msg) => console.error(`\x1b[31m[error]\x1b[0m ${msg}`);

async function tryFix(command, description) {
  try {
    log(`Trying: ${description}...`);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    log(`Success: ${description}`);
  } catch (err) {
    errorLog(`Failed: ${description}\n${err.message}`);
  }
}

/**
 * Fix broken multiline imports in src/App.tsx related to @tanstack/react-query
 */
async function fixBrokenImports() {
  try {
    await fs.access(appPath);
  } catch {
    log(`Skipped fixBrokenImports: ${appPath} not found.`);
    return;
  }

  let content = await fs.readFile(appPath, "utf8");
  const brokenImportRegex = /import\s+\{[^}]*\}\s+from\s+'@tanstack\/react-query'.*?\n.*?import\s+\{[^}]*\}\s+from\s+'@tanstack\/react-query';?/gs;

  if (brokenImportRegex.test(content)) {
    const fixedImport = `import { QueryCache, MutationCache } from '@tanstack/react-query';`;
    content = content.replace(brokenImportRegex, fixedImport);
    await fs.writeFile(appPath, content);
    log(`✅ Fixed broken react-query import in ${appPath}`);
  } else {
    log(`No broken react-query imports found in ${appPath}`);
  }
}

/**
 * Remove node_modules and package-lock.json and reinstall dependencies
 */
async function reinstallDependencies() {
  log("Checking for missing or broken node_modules...");
  await tryFix("rm -rf node_modules package-lock.json", "Clean node_modules and package-lock.json");
  await tryFix("npm install", "Reinstall dependencies");
}

/**
 * Run lint and prettier auto-fixes if configuration files are found
 */
async function fixLintAndFormat() {
  try {
    await fs.access(".eslintrc.js");
  } catch {
    try {
      await fs.access(".eslintrc.json");
    } catch {
      log("No ESLint config found, skipping lint fix.");
      return;
    }
  }
  await tryFix("npx eslint . --fix", "Auto-fix ESLint issues");

  try {
    await fs.access("prettier.config.js");
  } catch {
    try {
      await fs.access(".prettierrc");
    } catch {
      log("No Prettier config found, skipping formatting fix.");
      return;
    }
  }
  await tryFix("npx prettier --write .", "Auto-fix Prettier formatting");
}

/**
 * Check Node.js version against .nvmrc if present
 */
async function checkNodeVersion() {
  try {
    await fs.access(".nvmrc");
  } catch {
    log("No .nvmrc file found, skipping Node version check.");
    return;
  }

  const requiredVersion = (await fs.readFile(".nvmrc", "utf8")).trim();
  const currentVersion = process.version.slice(1);

  if (currentVersion !== requiredVersion) {
    log(`⚠️ Warning: Current Node.js version (${currentVersion}) does not match .nvmrc (${requiredVersion})`);
  } else {
    log(`Node.js version matches .nvmrc (${requiredVersion})`);
  }
}

/**
 * Run TypeScript type-check without emitting files
 */
async function runTypeCheck() {
  await tryFix("npx tsc --noEmit", "TypeScript type-check");
}

/**
 * Run the final build script
 */
async function runFinalBuild() {
  await tryFix("npm run build", "Final build attempt");
}

// CLI setup
const program = new Command();
program
  .description("Auto-repair build errors script")
  .option("--fix-imports", "Fix broken imports")
  .option("--reinstall", "Reinstall dependencies")
  .option("--lint", "Fix lint and formatting issues")
  .option("--check-node", "Check Node.js version")
  .option("--type-check", "Run TypeScript type check")
  .option("--build", "Run final build")
  .option("-a, --all", "Run all steps (default)", false)
  .parse(process.argv);

const options = program.opts();

async function main() {
  log("🔧 Starting auto-repair for build errors...");

  if (options.all || options.fixImports) await fixBrokenImports();
  if (options.all || options.reinstall) await reinstallDependencies();
  if (options.all || options.lint) await fixLintAndFormat();
  if (options.all || options.checkNode) await checkNodeVersion();
  if (options.all || options.typeCheck) await runTypeCheck();
  if (options.all || options.build) await runFinalBuild();

  log("✅ Done! Check output above for any remaining issues.");
}

main().catch((e) => {
  errorLog(`Unexpected error: ${e.message}`);
  process.exit(1);
});
