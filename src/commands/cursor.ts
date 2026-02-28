import { run } from "../lib/run";
import { ok, fail } from "../lib/output";

export async function cursor(): Promise<void> {
  const result = await run(["cliclick", "p"]);
  if (result.exitCode !== 0) {
    fail(`cursor position failed: ${result.stderr}`);
  }

  // cliclick p outputs something like "512,384"
  const match = result.stdout.match(/(\d+),\s*(\d+)/);
  if (!match) {
    fail(`unexpected cliclick output: ${result.stdout}`);
  }

  ok({ x: parseInt(match[1]), y: parseInt(match[2]) });
}
