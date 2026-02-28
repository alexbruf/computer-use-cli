import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { cursorCmd, parseCursorOutput } from "../lib/platform";

export async function cursor(): Promise<void> {
  const result = await run(cursorCmd());
  if (result.exitCode !== 0) {
    fail(`cursor position failed: ${result.stderr}`);
  }

  const pos = parseCursorOutput(result.stdout);
  if (isNaN(pos.x) || isNaN(pos.y)) {
    fail(`unexpected output: ${result.stdout}`);
  }

  ok(pos);
}
