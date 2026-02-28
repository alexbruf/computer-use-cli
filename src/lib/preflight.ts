import { run } from "./run";
import { fail } from "./output";

export async function checkCliclick(): Promise<{
  installed: boolean;
  path?: string;
  error?: string;
}> {
  const result = await run(["which", "cliclick"]);
  if (result.exitCode !== 0) {
    return {
      installed: false,
      error: "cliclick not found. Install with: brew install cliclick",
    };
  }
  return { installed: true, path: result.stdout };
}

export async function checkAccessibility(): Promise<{
  granted: boolean;
  error?: string;
}> {
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
  // CGWindowListCopyWindowInfo returns window names only when Screen Recording
  // permission is granted. Without it, window names/owners are empty.
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
 * Lightweight preflight — just checks cliclick is installed.
 * Called before commands that need it.
 */
export async function preflight(): Promise<void> {
  const cliclick = await checkCliclick();
  if (!cliclick.installed) {
    fail(cliclick.error!);
  }
}

/**
 * Full diagnostics — checks everything.
 */
export async function doctor(): Promise<void> {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  const cliclick = await checkCliclick();
  checks.cliclick = {
    ok: cliclick.installed,
    detail: cliclick.installed
      ? `found at ${cliclick.path}`
      : cliclick.error!,
  };

  if (cliclick.installed) {
    const accessibility = await checkAccessibility();
    checks.accessibility = {
      ok: accessibility.granted,
      detail: accessibility.granted
        ? "granted"
        : accessibility.error!,
    };
  } else {
    checks.accessibility = {
      ok: false,
      detail: "skipped (cliclick not installed)",
    };
  }

  const screenRec = await checkScreenRecording();
  checks.screen_recording = {
    ok: screenRec.granted,
    detail: screenRec.granted ? "granted" : screenRec.error!,
  };

  const allOk = Object.values(checks).every((c) => c.ok);

  // Doctor has custom output — show a nice checklist
  for (const [name, check] of Object.entries(checks)) {
    const icon = check.ok ? "OK" : "FAIL";
    console.log(`  ${icon}  ${name}: ${check.detail}`);
  }
  console.log();
  console.log(allOk ? "All checks passed." : "Some checks failed.");
  process.exit(allOk ? 0 : 1);
}
