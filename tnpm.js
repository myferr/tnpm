#!/usr/bin/env node

import { install } from "./lib/install.js";
import { uninstall } from "./lib/uninstall.js";
import { runCreateCommand } from "./lib/create.js";
import { runExecuteCommand } from "./lib/execute.js";
import { publish } from "./lib/publish.js";
import fs from "fs/promises";
import path from "path";
import { unpublish } from "./lib/unpublish.js";
import { showHelp } from "./lib/utils.js";

const args = process.argv.slice(2);
const [command, ...rest] = args;

async function main() {
  if (!command) {
    showHelp();
    return;
  }

  const cmd = command.toLowerCase();

  if (["publish", "pub"].includes(cmd)) {
    await publish();
    return;
  }
  if (["unpublish", "unpub"].includes(cmd)) {
    await unpublish();
    return;
  }

  // INSTALL
  if (["install", "i", "add", "get"].includes(cmd)) {
    const isGlobal = rest.includes("-g") || rest.includes("--global");
    const packages = rest.filter((arg) => arg !== "-g" && arg !== "--global");

    if (isGlobal) {
      if (packages.length === 0) {
        console.error("❌ Please specify packages to install globally.");
        return;
      }
      await install(packages, null, true);
    } else {
      if (packages.length === 0) {
        // Install from package.json locally
        await install();
      } else {
        // Install locally
        await install(packages);
      }
    }
    return;
  }

  if (["exec", "execute"].includes(cmd)) {
    const [pkgRaw] = rest;
    if (!pkgRaw) {
      console.error("❌ Please specify a package to execute");
      return;
    }
    const [pkgName, pkgVersion] = pkgRaw.split("@");
    try {
      await runExecuteCommand(pkgName, pkgVersion || "latest");
    } catch (e) {
      console.error("❌ Command failed:", e);
    }
    return;
  }

  // UNINSTALL
  if (["uninstall", "remove", "rm", "uni"].includes(cmd)) {
    if (rest.length === 0) {
      console.error("❌ Please specify packages to uninstall.");
      return;
    }

    // Check for global flag
    let globalFlag = false;
    const pkgs = [];
    for (const arg of rest) {
      if (arg === "-g" || arg === "--global") {
        globalFlag = true;
      } else {
        pkgs.push(arg);
      }
    }

    await uninstall(pkgs, { global: globalFlag });
    return;
  }

  // CREATE / INIT
  if (["create", "c", "init"].includes(cmd)) {
    const [toolRaw] = rest;
    if (!toolRaw) {
      console.error(
        "❌ Please specify a tool to create, like 'vite' or 'vite@latest'"
      );
      return;
    }

    const [toolName, toolVersion] = toolRaw.split("@");
    const fullPackage = `create-${toolName}`;
    const version = toolVersion || "latest";

    try {
      await runCreateCommand(fullPackage, version);
    } finally {
      // Always cleanup
      const createPath = path.resolve(".tnpm-create");
      await fs.rm(createPath, { recursive: true, force: true });
    }

    return;
  }

  console.error(`❌ Unknown command "${cmd}"`);
}

main().catch((err) => {
  console.error("❌ Command failed:", err);
});
