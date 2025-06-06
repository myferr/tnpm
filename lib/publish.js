import { spawn } from "child_process";

export async function publish() {
  await new Promise((resolve, reject) => {
    const proc = spawn("npm", ["publish"], {
      stdio: "inherit",
    });

    proc.on("exit", (code) => {
      if (code !== 0) return reject(new Error("❌ npm publish failed"));
      resolve();
    });

    proc.on("error", reject);
  });
}
