#!/usr/bin/env node

import { runExecuteCommand } from "./lib/execute.js";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: tnpx <package>[@version] [args...]");
    process.exit(1);
  }

  const [pkgRaw, ...rest] = args;
  const [pkgName, pkgVersion] = pkgRaw.split("@");

  try {
    await runExecuteCommand(pkgName, pkgVersion || "latest", rest);
  } catch (err) {
    console.error("❌ Execute failed:", err.message);
    process.exit(1);
  }
}

main();
