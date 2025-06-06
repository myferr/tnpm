import { spawn } from "child_process";

export async function unpublish() {
  await new Promise((resolve, reject) => {
    const proc = spawn("npm", ["unpublish"], {
      stdio: "inherit",
    });

    proc.on("exit", (code) => {
      if (code !== 0) return reject(new Error("❌ npm unpublish failed"));
      resolve();
    });

    proc.on("error", reject);
  });
}
