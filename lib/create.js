import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";
import { install } from "./install.js";

export async function runCreateCommand(tool, version = "latest") {
  const tmpDir = path.resolve(".tnpm-create", tool);
  const installPath = path.join(tmpDir, "node_modules", tool);

  console.log(`🔍 Fetching metadata for "${tool}@${version}"...`);
  await install([`${tool}@${version}`], tmpDir);

  console.log(`🎉 Done! Installed 1 package(s).`);

  // Load the tool's package.json to find the entrypoint
  const pkgJsonPath = path.join(installPath, "package.json");

  let pkg;
  try {
    const data = await fs.readFile(pkgJsonPath, "utf-8");
    pkg = JSON.parse(data);
  } catch {
    throw new Error(`Create failed: could not read ${pkgJsonPath}`);
  }

  // Get bin or main entrypoint
  let entry;
  if (typeof pkg.bin === "string") {
    entry = path.join(installPath, pkg.bin);
  } else if (typeof pkg.bin === "object") {
    const firstBin = Object.values(pkg.bin)[0];
    entry = path.join(installPath, firstBin);
  } else if (pkg.main) {
    entry = path.join(installPath, pkg.main);
  } else {
    throw new Error(`Create failed: no entry point found in ${tool}`);
  }

  // Spawn the CLI
  const child = spawn("node", [entry, ...process.argv.slice(3)], {
    stdio: "inherit",
  });

  await new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code !== 0)
        return reject(new Error(`Process exited with code ${code}`));
      resolve();
    });
    child.on("error", reject);
  });
}
