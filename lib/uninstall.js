import fs from "fs";
import { rm } from "fs/promises";
import path from "path";

async function removeGlobalBin(name) {
  const binPath = path.resolve(process.env.HOME, ".tnpm-global", "bin", name);
  try {
    await rm(binPath, { force: true });
  } catch {
    // ignore if doesn't exist
  }
}

async function uninstall(packages, { global = false } = {}) {
  let removedCount = 0;

  if (global) {
    const globalPath = path.resolve(process.env.HOME, ".tnpm-global");

    for (const name of packages) {
      const modulePath = path.join(globalPath, "node_modules", name);
      if (fs.existsSync(modulePath)) {
        await rm(modulePath, { recursive: true, force: true });
        await removeGlobalBin(name);
        console.log(`🧹 Globally uninstalled ${name}`);
        removedCount++;
      } else {
        console.log(`⚠️  Global package ${name} not found`);
      }
    }
  } else {
    for (const name of packages) {
      const modulePath = `node_modules/${name}`;
      if (fs.existsSync(modulePath)) {
        await rm(modulePath, { recursive: true, force: true });
        console.log(`🧹 Uninstalled ${name}`);
        removedCount++;
      } else {
        console.log(`⚠️  ${name} not found`);
      }
    }

    const pkgJsonPath = "package.json";
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(await fs.readFile(pkgJsonPath, "utf-8"));
      let removedFromPkgJson = 0;

      for (const name of packages) {
        if (pkg.dependencies && pkg.dependencies[name]) {
          delete pkg.dependencies[name];
          removedFromPkgJson++;
        }
      }

      await fs.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2));
    }
  }

  console.log(
    `🗑️ Removed ${removedCount} package${removedCount !== 1 ? "s" : ""}.`
  );
}

export { uninstall };
