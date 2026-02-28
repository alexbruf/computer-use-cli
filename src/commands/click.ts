import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { extractFlag } from "../lib/args";

export async function click(args: string[]): Promise<void> {
  const x = parseInt(args[0]);
  const y = parseInt(args[1]);
  if (isNaN(x) || isNaN(y)) {
    fail("click requires <x> <y> coordinates");
  }

  const button = extractFlag(args, "--button") ?? "left";
  const prefix: Record<string, string> = {
    left: "c",
    right: "rc",
    double: "dc",
  };

  const cmd = prefix[button];
  if (!cmd) {
    fail(`unknown button: ${button}. Use left, right, or double`);
  }

  const result = await run(["cliclick", `${cmd}:${x},${y}`]);
  if (result.exitCode !== 0) {
    fail(`click failed: ${result.stderr}`);
  }

  ok({ x, y, button });
}
