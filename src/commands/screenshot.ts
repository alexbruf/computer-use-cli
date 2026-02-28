import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { extractFlag } from "../lib/args";
import { unlink } from "node:fs/promises";

export async function screenshot(args: string[]): Promise<void> {
  const fileArg = extractFlag(args, "--file");
  const displayArg = extractFlag(args, "--display");

  const targetPath =
    fileArg ?? `/tmp/computer-use-screenshot-${Date.now()}.png`;

  const cmd = ["screencapture", "-x"]; // -x = no sound
  if (displayArg) cmd.push("-D", displayArg);
  cmd.push(targetPath);

  const result = await run(cmd, { timeout: 5000 });
  if (result.exitCode !== 0) {
    fail(`screencapture failed: ${result.stderr}`);
  }

  if (fileArg) {
    ok({ file: targetPath, format: "png" });
  } else {
    try {
      const bytes = await Bun.file(targetPath).arrayBuffer();
      const b64 = Buffer.from(bytes).toString("base64");
      ok({ base64_image: b64, format: "png" });
    } finally {
      try {
        await unlink(targetPath);
      } catch {}
    }
  }
}
