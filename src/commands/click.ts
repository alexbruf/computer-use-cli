import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { extractFlag } from "../lib/args";
import { clickCmd } from "../lib/platform";

export async function click(args: string[]): Promise<void> {
  const x = parseInt(args[0]);
  const y = parseInt(args[1]);
  if (isNaN(x) || isNaN(y)) {
    fail("click requires <x> <y> coordinates");
  }

  const button = extractFlag(args, "--button") ?? "left";
  if (!["left", "right", "double"].includes(button)) {
    fail(`unknown button: ${button}. Use left, right, or double`);
  }

  const result = await run(clickCmd(x, y, button));
  if (result.exitCode !== 0) {
    fail(`click failed: ${result.stderr}`);
  }

  ok({ x, y, button });
}
