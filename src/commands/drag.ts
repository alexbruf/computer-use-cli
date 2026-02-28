import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { dragCmd } from "../lib/platform";

export async function drag(args: string[]): Promise<void> {
  const fromX = parseInt(args[0]);
  const fromY = parseInt(args[1]);
  const toX = parseInt(args[2]);
  const toY = parseInt(args[3]);

  if ([fromX, fromY, toX, toY].some(isNaN)) {
    fail("drag requires <fromX> <fromY> <toX> <toY>");
  }

  const result = await run(dragCmd(fromX, fromY, toX, toY));
  if (result.exitCode !== 0) {
    fail(`drag failed: ${result.stderr}`);
  }

  ok({ fromX, fromY, toX, toY });
}
