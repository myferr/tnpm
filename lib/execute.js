import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";
import { install } from "./install.js";

export async function runExecuteCommand(packageName, version = "latest") {
  // Use a fixed exec folder
  const execDir = path.resolve(".tnpm-exec");
  const installPath = path.join(execDir, "node_modules", packageName);

  console.log(`🔍 Fetching metadata for "${packageName}@${version}"...`);
  // Install into .tnpm-exec/node_modules/packageName
  await install([`${packageName}@${version}`], execDir);

  console.log(`✅ Installed ${packageName}@${version}`);

  // Read package.json from installPath
  const pkgJsonPath = path.join(installPath, "package.json");

  let pkg;
  try {
    const data = await fs.readFile(pkgJsonPath, "utf-8");
    pkg = JSON.parse(data);
  } catch {
    throw new Error(`Execute failed: could not read ${pkgJsonPath}`);
  }

  // Determine entrypoint
  let entry;
  if (typeof pkg.bin === "string") {
    entry = path.join(installPath, pkg.bin);
  } else if (typeof pkg.bin === "object") {
    const firstBin = Object.values(pkg.bin)[0];
    entry = path.join(installPath, firstBin);
  } else if (pkg.main) {
    entry = path.join(installPath, pkg.main);
  } else {
    throw new Error(`Execute failed: no entry point found in ${packageName}`);
  }

  console.log(`🚀 Running ${packageName} CLI...`);

  // Spawn the package CLI with the remaining CLI args (excluding tnpm and command)
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
