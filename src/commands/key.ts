import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { parseKeyCombo } from "../lib/keys";
import { keyCmd, platform } from "../lib/platform";

export async function key(args: string[]): Promise<void> {
  const combo = args[0];
  if (!combo) {
    fail("key requires a key combo (e.g., cmd+c, Return, ctrl+shift+a)");
  }

  // Linux: xdotool handles key combos natively
  // macOS: cliclick needs kd:/kp:/ku: decomposition
  const cmd = platform === "linux"
    ? keyCmd(combo)
    : ["cliclick", ...parseKeyCombo(combo)];

  const result = await run(cmd);
  if (result.exitCode !== 0) {
    fail(`key failed: ${result.stderr}`);
  }

  ok({ key: combo });
}
