export type Platform = "darwin" | "linux";

export function getPlatform(): Platform {
  const p = process.platform;
  if (p === "darwin") return "darwin";
  if (p === "linux") return "linux";
  throw new Error(`Unsupported platform: ${p}. Only macOS and Linux are supported.`);
}

const platform = getPlatform();

// ── Key mapping for Linux (xdotool uses X11 key names) ──────────

const LINUX_KEY_MAP: Record<string, string> = {
  cmd: "super",
  command: "super",
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  option: "alt",
  shift: "shift",
  fn: "fn",
  return: "Return",
  enter: "Return",
  tab: "Tab",
  space: "space",
  escape: "Escape",
  esc: "Escape",
  delete: "BackSpace",
  backspace: "BackSpace",
  forwarddelete: "Delete",
  up: "Up",
  down: "Down",
  left: "Left",
  right: "Right",
  home: "Home",
  end: "End",
  pageup: "Prior",
  pagedown: "Next",
  f1: "F1", f2: "F2", f3: "F3", f4: "F4",
  f5: "F5", f6: "F6", f7: "F7", f8: "F8",
  f9: "F9", f10: "F10", f11: "F11", f12: "F12",
  f13: "F13", f14: "F14", f15: "F15", f16: "F16",
};

// ── Command builders ─────────────────────────────────────────────

export function clickCmd(x: number, y: number, button: string): string[] {
  if (platform === "linux") {
    const btn = { left: "1", right: "3", double: "1" }[button] ?? "1";
    const base = ["xdotool", "mousemove", "--sync", String(x), String(y)];
    if (button === "double") {
      return [...base, "click", "--repeat", "2", "--delay", "50", btn];
    }
    return [...base, "click", btn];
  }
  const prefix = { left: "c", right: "rc", double: "dc" }[button] ?? "c";
  return ["cliclick", `${prefix}:${x},${y}`];
}

export function moveCmd(x: number, y: number): string[] {
  if (platform === "linux") {
    return ["xdotool", "mousemove", "--sync", String(x), String(y)];
  }
  return ["cliclick", `m:${x},${y}`];
}

export function dragCmd(fx: number, fy: number, tx: number, ty: number): string[] {
  if (platform === "linux") {
    return [
      "xdotool", "mousemove", "--sync", String(fx), String(fy),
      "mousedown", "1",
      "mousemove", "--sync", String(tx), String(ty),
      "mouseup", "1",
    ];
  }
  return ["cliclick", `dd:${fx},${fy}`, `du:${tx},${ty}`];
}

export function typeCmd(text: string): string[] {
  if (platform === "linux") {
    return ["xdotool", "type", "--clearmodifiers", "--delay", "20", "--", text];
  }
  return ["cliclick", `t:${text}`];
}

export function keyCmd(combo: string): string[] {
  if (platform === "linux") {
    // xdotool uses "ctrl+c" syntax directly, but key names differ
    const parts = combo.split("+").map((p) => p.trim().toLowerCase());
    const mapped = parts.map((p) => LINUX_KEY_MAP[p] ?? p);
    return ["xdotool", "key", "--clearmodifiers", mapped.join("+")];
  }

  // macOS: use cliclick kd:/kp:/ku: (import parseKeyCombo from keys.ts)
  // Handled in the command file since it needs the keys module
  return []; // placeholder — macOS uses parseKeyCombo directly
}

export function cursorCmd(): string[] {
  if (platform === "linux") {
    return ["xdotool", "getmouselocation", "--shell"];
  }
  return ["cliclick", "p"];
}

export function parseCursorOutput(stdout: string): { x: number; y: number } {
  if (platform === "linux") {
    // xdotool outputs: X=512\nY=384\nSCREEN=0\nWINDOW=12345
    const vars: Record<string, string> = {};
    for (const line of stdout.split("\n")) {
      const [k, v] = line.split("=");
      if (k && v) vars[k.trim()] = v.trim();
    }
    return { x: parseInt(vars.X ?? "0"), y: parseInt(vars.Y ?? "0") };
  }
  // cliclick outputs: "512,384"
  const match = stdout.match(/(\d+),\s*(\d+)/);
  return {
    x: match ? parseInt(match[1]) : 0,
    y: match ? parseInt(match[2]) : 0,
  };
}

export function screenshotCmd(targetPath: string, displayArg?: string): string[] {
  if (platform === "linux") {
    return ["scrot", "-o", "-F", targetPath];
  }
  const cmd = ["screencapture", "-x"];
  if (displayArg) cmd.push("-D", displayArg);
  cmd.push(targetPath);
  return cmd;
}

export function scrollCmd(direction: string, amount: number): string[] | null {
  if (platform === "linux") {
    // xdotool: button 4=up, 5=down, 6=left, 7=right
    const btn: Record<string, string> = {
      up: "4", down: "5", left: "6", right: "7",
    };
    return ["xdotool", "click", "--repeat", String(amount), btn[direction]];
  }
  // macOS uses swift CGEvent — return null to signal "use swift approach"
  return null;
}

export function screenSizeCmd(): string[] | null {
  if (platform === "linux") {
    return ["xdotool", "getdisplaygeometry"];
  }
  // macOS uses system_profiler — return null to signal "use macOS approach"
  return null;
}

export function parseScreenSizeOutput(stdout: string): { width: number; height: number } {
  // xdotool getdisplaygeometry outputs: "1920 1080"
  const parts = stdout.trim().split(/\s+/);
  return { width: parseInt(parts[0]), height: parseInt(parts[1]) };
}

// ── Dependency info ──────────────────────────────────────────────

export function requiredTool(): string {
  return platform === "linux" ? "xdotool" : "cliclick";
}

export function installHint(): string {
  if (platform === "linux") {
    return "xdotool not found. Install with: apt install xdotool (Debian/Ubuntu) or dnf install xdotool (Fedora)";
  }
  return "cliclick not found. Install with: brew install cliclick";
}

export function screenshotTool(): string {
  return platform === "linux" ? "scrot" : "screencapture";
}

export function screenshotInstallHint(): string {
  if (platform === "linux") {
    return "scrot not found. Install with: apt install scrot (Debian/Ubuntu) or dnf install scrot (Fedora)";
  }
  return "screencapture should be built-in on macOS";
}

export { platform };
