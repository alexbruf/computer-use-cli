const KEY_MAP: Record<string, string> = {
  // Modifiers (used with kd:/ku:)
  cmd: "cmd",
  command: "cmd",
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  option: "alt",
  shift: "shift",
  fn: "fn",

  // Regular keys (used with kp:)
  return: "return",
  enter: "return",
  tab: "tab",
  space: "space",
  escape: "esc",
  esc: "esc",
  delete: "delete",
  backspace: "delete",
  forwarddelete: "fwd-delete",

  // Arrow keys
  up: "arrow-up",
  down: "arrow-down",
  left: "arrow-left",
  right: "arrow-right",

  // Navigation
  home: "home",
  end: "end",
  pageup: "page-up",
  pagedown: "page-down",

  // Function keys
  f1: "f1",
  f2: "f2",
  f3: "f3",
  f4: "f4",
  f5: "f5",
  f6: "f6",
  f7: "f7",
  f8: "f8",
  f9: "f9",
  f10: "f10",
  f11: "f11",
  f12: "f12",
  f13: "f13",
  f14: "f14",
  f15: "f15",
  f16: "f16",
};

const MODIFIERS = new Set(["cmd", "command", "ctrl", "control", "alt", "option", "shift", "fn"]);

/**
 * Parse a key combo string like "cmd+c" or "cmd+shift+s" or "Return"
 * into cliclick arguments: ["kd:cmd", "kp:c", "ku:cmd"]
 */
export function parseKeyCombo(combo: string): string[] {
  const parts = combo.split("+").map((p) => p.trim().toLowerCase());
  const modifiers: string[] = [];
  const keys: string[] = [];

  for (const part of parts) {
    if (MODIFIERS.has(part)) {
      modifiers.push(part);
    } else {
      keys.push(part);
    }
  }

  const args: string[] = [];

  // Key down for each modifier
  for (const mod of modifiers) {
    const mapped = KEY_MAP[mod] ?? mod;
    args.push(`kd:${mapped}`);
  }

  // Press each key
  for (const key of keys) {
    const mapped = KEY_MAP[key] ?? key;
    args.push(`kp:${mapped}`);
  }

  // Key up for each modifier (reverse order)
  for (const mod of modifiers.reverse()) {
    const mapped = KEY_MAP[mod] ?? mod;
    args.push(`ku:${mapped}`);
  }

  return args;
}
