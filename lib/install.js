import fs from "fs/promises";
import path from "path";
import https from "https";
import * as tar from "tar";
import os from "os";
import { chmodSync } from "fs";
import { registry } from "./utils.js";

async function readPackageJson(dir = process.cwd()) {
  try {
    const data = await fs.readFile(path.join(dir, "package.json"), "utf-8");
    return JSON.parse(data);
  } catch {
    return { name: "my-project", version: "1.0.0", dependencies: {} };
  }
}

async function writePackageJson(pkg, dir = process.cwd()) {
  const data = JSON.stringify(pkg, null, 2);
  await fs.writeFile(path.join(dir, "package.json"), data, "utf-8");
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    });
  });
}

async function downloadAndExtract(tarballUrl, dest) {
  return new Promise((resolve, reject) => {
    https.get(tarballUrl, (res) => {
      if (res.statusCode !== 200) {
        return reject(
          new Error(`Failed to download tarball: ${res.statusCode}`)
        );
      }
      res.pipe(tar.x({ cwd: dest, strip: 1 }));
      res.on("end", resolve);
      res.on("error", reject);
    });
  });
}

// Helper to create bin shims for global installs
async function createBinShims(pkgJson, installPath, binDir) {
  if (!pkgJson.bin) return;

  // Normalize bin to an object
  let bins = {};
  if (typeof pkgJson.bin === "string") {
    bins[pkgJson.name] = pkgJson.bin;
  } else {
    bins = pkgJson.bin;
  }

  await fs.mkdir(binDir, { recursive: true });

  for (const [name, binPath] of Object.entries(bins)) {
    const fullBinPath = path.join(installPath, binPath);

    // Shim script path in binDir
    const shimPath = path.join(binDir, name);

    // On Windows, you might want to create .cmd files, but here is a Unix shim:
    const shimContent = `#!/usr/bin/env node
require("${fullBinPath.replace(/\\/g, "\\\\")}");
`;

    await fs.writeFile(shimPath, shimContent, { mode: 0o755 });
    chmodSync(shimPath, 0o755);

    // For Unix systems, the above is enough. On Windows, consider .cmd wrappers.
  }
}

function parsePackageNameVersion(input) {
  if (input.startsWith("@")) {
    // scoped package
    const secondAt = input.indexOf("@", 1);
    if (secondAt === -1) {
      return { name: input, version: "latest" };
    }
    return {
      name: input.slice(0, secondAt),
      version: input.slice(secondAt + 1) || "latest",
    };
  } else {
    // non-scoped package
    const firstAt = input.indexOf("@");
    if (firstAt === -1) {
      return { name: input, version: "latest" };
    }
    return {
      name: input.slice(0, firstAt),
      version: input.slice(firstAt + 1) || "latest",
    };
  }
}

export async function install(
  packageArgs = [],
  targetDir = process.cwd(),
  globalInstall = false
) {
  const installedPackages = new Set();

  // For global installs, bin dir is ~/.tnpm-global/bin
  const binDir = globalInstall
    ? path.join(process.env.HOME || os.homedir(), ".tnpm-global", "bin")
    : null;

  async function _install(pkgName, version) {
    if (installedPackages.has(pkgName)) return;

    console.log(`🔍 Fetching metadata for "${pkgName}@${version}"...`);
    const metadata = await fetchJson(`${registry}${pkgName}`);

    if (version === "latest") {
      version = metadata["dist-tags"].latest;
    } else if (!metadata.versions[version]) {
      version = metadata["dist-tags"].latest;
    }

    const versionData = metadata.versions[version];
    if (!versionData)
      throw new Error(`Version ${version} not found for ${pkgName}`);

    const tarballUrl = versionData.dist.tarball;
    console.log(`📦 Downloading ${pkgName}@${version}...`);

    // install path: if global, under ~/.tnpm-global/node_modules/pkgName
    const baseDir = globalInstall
      ? path.join(process.env.HOME || os.homedir(), ".tnpm-global")
      : targetDir;
    const nodeModulesPath = path.join(
      baseDir,
      "node_modules",
      ...pkgName.split("/")
    );

    await fs.mkdir(nodeModulesPath, { recursive: true });
    await downloadAndExtract(tarballUrl, nodeModulesPath);

    installedPackages.add(pkgName);
    console.log(`✅ Installed ${pkgName}@${version}`);

    if (!globalInstall && targetDir === process.cwd()) {
      // Update local package.json dependencies
      const pkgJson = await readPackageJson();
      pkgJson.dependencies = pkgJson.dependencies || {};
      pkgJson.dependencies[pkgName] = `^${version}`;
      await writePackageJson(pkgJson);
    }

    // Install dependencies recursively (no logs to avoid noise)
    const deps = versionData.dependencies || {};
    for (const dep in deps) {
      await _install(dep, deps[dep]);
    }

    // If global install, create bin shims
    if (globalInstall) {
      const pkgJsonPath = path.join(nodeModulesPath, "package.json");
      let pkgJson;
      try {
        const data = await fs.readFile(pkgJsonPath, "utf-8");
        pkgJson = JSON.parse(data);
      } catch {
        console.warn(
          `⚠️ Could not read package.json for ${pkgName}, skipping bin shims.`
        );
        return;
      }

      await createBinShims(pkgJson, nodeModulesPath, binDir);
    }
  }

  try {
    let packagesToInstall = [];

    if (packageArgs.length === 0) {
      const pkgJson = await readPackageJson();
      packagesToInstall = Object.entries(pkgJson.dependencies || {}).map(
        ([name, ver]) => `${name}@${ver.replace(/^[\^~]/, "")}`
      );
    } else {
      packagesToInstall = packageArgs;
    }

    for (const full of packagesToInstall) {
      const { name, version } = parsePackageNameVersion(full);
      await _install(name, version);
    }

    if (targetDir === process.cwd() && !globalInstall) {
      console.log(`🎉 Done! Installed ${installedPackages.size} package(s).`);
    } else if (globalInstall) {
      console.log(
        `🎉 Done! Globally installed ${installedPackages.size} package(s).`
      );
      console.log(
        `👉 Make sure ${binDir} is in your PATH environment variable.`
      );
    }
  } catch (err) {
    console.error(`❌ Install failed: ${err.message}`);
  }
}
