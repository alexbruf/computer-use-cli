import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { parseKeyCombo } from "../lib/keys";

export async function key(args: string[]): Promise<void> {
  const combo = args[0];
  if (!combo) {
    fail("key requires a key combo (e.g., cmd+c, Return, ctrl+shift+a)");
  }

  const cliclickArgs = parseKeyCombo(combo);
  const result = await run(["cliclick", ...cliclickArgs]);
  if (result.exitCode !== 0) {
    fail(`key failed: ${result.stderr}`);
  }

  ok({ key: combo });
}
