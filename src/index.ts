#!/usr/bin/env bun

import { screenshot } from "./commands/screenshot";
import { click } from "./commands/click";
import { move } from "./commands/move";
import { drag } from "./commands/drag";
import { typeText } from "./commands/type";
import { key } from "./commands/key";
import { cursor } from "./commands/cursor";
import { scroll } from "./commands/scroll";
import { screenSize } from "./commands/screen-size";
import { preflight, doctor } from "./lib/preflight";
import { fail, setJsonMode } from "./lib/output";

const COMMANDS: Record<string, (args: string[]) => Promise<void>> = {
  screenshot,
  click,
  move,
  drag,
  type: typeText,
  key,
  cursor,
  scroll,
  "screen-size": screenSize,
};

// Commands that need the main automation tool (cliclick on macOS, xdotool on Linux)
const NEEDS_TOOL = new Set([
  "click",
  "move",
  "drag",
  "type",
  "key",
  "cursor",
]);

function printUsage(): void {
  const usage = `computer-use — Native computer automation CLI (macOS + Linux)

Usage: computer-use <command> [args]

Commands:
  screenshot [--file path] [--display N]  Capture screen (returns base64 PNG or saves file)
  click <x> <y> [--button left|right|double]  Click at coordinates
  move <x> <y>                            Move cursor to coordinates
  drag <fromX> <fromY> <toX> <toY>       Drag between coordinates
  type <text>                             Type text at keyboard
  key <combo>                             Press key combo (e.g. cmd+c, Return)
  cursor                                  Get current cursor position
  scroll <up|down|left|right> [--amount N]  Scroll in direction
  screen-size                             Get screen dimensions
  doctor                                  Check dependencies and permissions

Global flags:
  --json                                  Output JSON instead of human-readable text`;

  console.log(usage);
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);

  // Strip global --json flag
  const jsonIdx = rawArgs.indexOf("--json");
  if (jsonIdx !== -1) {
    setJsonMode(true);
    rawArgs.splice(jsonIdx, 1);
  }

  const [command, ...args] = rawArgs;

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  if (command === "doctor") {
    await doctor();
    return;
  }

  // Lightweight preflight for commands that need the automation tool
  if (NEEDS_TOOL.has(command)) {
    await preflight();
  }

  const handler = COMMANDS[command];
  if (!handler) {
    fail(`unknown command: ${command}. Run 'computer-use --help' for usage.`);
  }

  await handler(args);
}

main().catch((err) => {
  fail(`unexpected error: ${err instanceof Error ? err.message : String(err)}`);
});
