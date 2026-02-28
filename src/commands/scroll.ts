import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { extractFlag } from "../lib/args";
import { scrollCmd } from "../lib/platform";

export async function scroll(args: string[]): Promise<void> {
  const direction = args[0];
  if (!["up", "down", "left", "right"].includes(direction)) {
    fail("scroll requires direction: up, down, left, or right");
  }

  const rawAmount = parseInt(extractFlag(args, "--amount") ?? "3");
  if (isNaN(rawAmount) || rawAmount < 1) {
    fail("--amount must be a positive integer");
  }
  const amount = Math.min(rawAmount, 100);

  // Linux: xdotool click with scroll button
  // macOS: Swift CGEvent (scrollCmd returns null)
  const cmd = scrollCmd(direction, amount);

  if (cmd) {
    const result = await run(cmd);
    if (result.exitCode !== 0) {
      fail(`scroll failed: ${result.stderr}`);
    }
  } else {
    // macOS: use Swift CGEvent
    const wheelValues: Record<string, [number, number]> = {
      up: [amount, 0],
      down: [-amount, 0],
      left: [0, amount],
      right: [0, -amount],
    };
    const [wheel1, wheel2] = wheelValues[direction];

    const swiftCode = `
import CoreGraphics
if let event = CGEvent(scrollWheelEvent2Source: nil, units: .line, wheelCount: 2, wheel1: Int32(${wheel1}), wheel2: Int32(${wheel2}), wheel3: 0) {
    event.post(tap: .cghidEventTap)
}
`;
    const result = await run(["swift", "-e", swiftCode], { timeout: 10_000 });
    if (result.exitCode !== 0) {
      fail(`scroll failed: ${result.stderr}`);
    }
  }

  ok({ direction, amount });
}
