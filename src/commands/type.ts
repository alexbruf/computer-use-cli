import { run } from "../lib/run";
import { ok, fail } from "../lib/output";

export async function typeText(args: string[]): Promise<void> {
  const text = args.join(" ");
  if (!text) {
    fail("type requires text argument");
  }

  const result = await run(["cliclick", `t:${text}`], {
    timeout: Math.max(10_000, text.length * 50),
  });
  if (result.exitCode !== 0) {
    fail(`type failed: ${result.stderr}`);
  }

  ok({ typed: text.length, text });
}
