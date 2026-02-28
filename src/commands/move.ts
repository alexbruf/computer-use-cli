import { run } from "../lib/run";
import { ok, fail } from "../lib/output";

export async function move(args: string[]): Promise<void> {
  const x = parseInt(args[0]);
  const y = parseInt(args[1]);
  if (isNaN(x) || isNaN(y)) {
    fail("move requires <x> <y> coordinates");
  }

  const result = await run(["cliclick", `m:${x},${y}`]);
  if (result.exitCode !== 0) {
    fail(`move failed: ${result.stderr}`);
  }

  ok({ x, y });
}
