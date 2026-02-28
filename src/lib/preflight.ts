import { run } from "./run";
import { fail } from "./output";
import {
  platform,
  requiredTool,
  installHint,
  screenshotTool,
  screenshotInstallHint,
} from "./platform";

export async function checkMainTool(): Promise<{
  installed: boolean;
  path?: string;
  error?: string;
}> {
  const tool = requiredTool();
  const result = await run(["which", tool]);
  if (result.exitCode !== 0) {
    return { installed: false, error: installHint() };
  }
  return { installed: true, path: result.stdout };
}

export async function checkScreenshotTool(): Promise<{
  installed: boolean;
  path?: string;
  error?: string;
}> {
  const tool = screenshotTool();
  // screencapture is always available on macOS
  if (platform === "darwin") return { installed: true };

  const result = await run(["which", tool]);
  if (result.exitCode !== 0) {
    return { installed: false, error: screenshotInstallHint() };
  }
  return { installed: true, path: result.stdout };
}

export async function checkAccessibility(): Promise<{
  granted: boolean;
  error?: string;
}> {
  if (platform === "linux") {
    // On Linux, check DISPLAY is set and xdotool can query it
    if (!process.env.DISPLAY) {
      return {
        granted: false,
        error: "DISPLAY environment variable not set. X11 display required.",
      };
    }
    const result = await run(["xdotool", "getmouselocation"], { timeout: 3000 });
    if (result.exitCode !== 0) {
      return {
        granted: false,
        error: `xdotool cannot access display ${process.env.DISPLAY}: ${result.stderr}`,
      };
    }
    return { granted: true };
  }

  // macOS: check cliclick can run (needs Accessibility permission)
  const result = await run(["cliclick", "p"], { timeout: 3000 });
  if (result.exitCode !== 0) {
    return {
      granted: false,
      error:
        "Accessibility permission not granted. Go to System Settings > Privacy & Security > Accessibility and enable your terminal app.",
    };
  }
  return { granted: true };
}

export async function checkScreenRecording(): Promise<{
  granted: boolean;
  error?: string;
}> {
  if (platform === "linux") {
    // On Linux with X11, screen capture generally works if DISPLAY is set
    // Just verify scrot can take a screenshot
    const tmpFile = `/tmp/computer-use-preflight-${Date.now()}.png`;
    const result = await run(["scrot", "-o", "-F", tmpFile], { timeout: 5000 });
    try {
      if (result.exitCode !== 0) {
        return { granted: false, error: `scrot failed: ${result.stderr}` };
      }
      const file = Bun.file(tmpFile);
      if (file.size < 100) {
        return { granted: false, error: "scrot produced an empty screenshot" };
      }
      return { granted: true };
    } finally {
      try {
        const { unlink } = await import("node:fs/promises");
        await unlink(tmpFile);
      } catch {}
    }
  }

  // macOS: check CGWindowListCopyWindowInfo for Screen Recording permission
  const swiftCheck = `
import CoreGraphics
let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
let namedWindows = windows.filter { ($0["kCGWindowOwnerName"] as? String) != nil && ($0["kCGWindowName"] as? String) != nil }
print(namedWindows.count > 0 ? "granted" : "denied")
`;
  const result = await run(["swift", "-e", swiftCheck], { timeout: 15_000 });
  if (result.exitCode !== 0) {
    return {
      granted: false,
      error: `Screen Recording check failed: ${result.stderr}`,
    };
  }
  if (result.stdout.trim() === "denied") {
    return {
      granted: false,
      error:
        "Screen Recording permission not granted. Go to System Settings > Privacy & Security > Screen Recording, enable your terminal app, then restart it.",
    };
  }
  return { granted: true };
}

/**
 * Lightweight preflight — just checks the main tool is installed.
 */
export async function preflight(): Promise<void> {
  const main = await checkMainTool();
  if (!main.installed) {
    fail(main.error!);
  }
}

/**
 * Full diagnostics.
 */
export async function doctor(): Promise<void> {
  const tool = requiredTool();
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  const main = await checkMainTool();
  checks[tool] = {
    ok: main.installed,
    detail: main.installed ? `found at ${main.path}` : main.error!,
  };

  if (platform === "linux") {
    const scrot = await checkScreenshotTool();
    checks.scrot = {
      ok: scrot.installed,
      detail: scrot.installed
        ? `found at ${scrot.path}`
        : scrot.error!,
    };
  }

  if (main.installed) {
    const accessibility = await checkAccessibility();
    checks[platform === "linux" ? "display" : "accessibility"] = {
      ok: accessibility.granted,
      detail: accessibility.granted ? "granted" : accessibility.error!,
    };
  } else {
    checks[platform === "linux" ? "display" : "accessibility"] = {
      ok: false,
      detail: `skipped (${tool} not installed)`,
    };
  }

  const screenRec = await checkScreenRecording();
  checks.screen_capture = {
    ok: screenRec.granted,
    detail: screenRec.granted ? "granted" : screenRec.error!,
  };

  const allOk = Object.values(checks).every((c) => c.ok);

  console.log(`  Platform: ${platform}`);
  for (const [name, check] of Object.entries(checks)) {
    const icon = check.ok ? "OK" : "FAIL";
    console.log(`  ${icon}  ${name}: ${check.detail}`);
  }
  console.log();
  console.log(allOk ? "All checks passed." : "Some checks failed.");
  process.exit(allOk ? 0 : 1);
}
