import { run } from "../lib/run";
import { ok, fail } from "../lib/output";
import { screenSizeCmd, parseScreenSizeOutput } from "../lib/platform";

export async function screenSize(): Promise<void> {
  const cmd = screenSizeCmd();

  if (cmd) {
    // Linux: xdotool getdisplaygeometry
    const result = await run(cmd, { timeout: 5000 });
    if (result.exitCode !== 0) {
      fail(`screen-size failed: ${result.stderr}`);
    }
    const { width, height } = parseScreenSizeOutput(result.stdout);
    if (isNaN(width) || isNaN(height)) {
      fail(`unexpected output: ${result.stdout}`);
    }
    ok({ width, height });
  } else {
    // macOS: system_profiler
    const result = await run(
      ["system_profiler", "SPDisplaysDataType", "-json"],
      { timeout: 10_000 }
    );
    if (result.exitCode !== 0) {
      fail(`system_profiler failed: ${result.stderr}`);
    }

    try {
      const data = JSON.parse(result.stdout);
      const gpus = data.SPDisplaysDataType ?? [];
      const displays: Array<{
        name: string;
        width: number;
        height: number;
        retina_width: number;
        retina_height: number;
        main: boolean;
      }> = [];

      for (const gpu of gpus) {
        const ndrvs = gpu.spdisplays_ndrvs ?? [];
        for (const d of ndrvs) {
          const resMatch = d._spdisplays_resolution?.match(/(\d+)\s*x\s*(\d+)/);
          const pixMatch = d.spdisplays_pixelresolution?.match(/(\d+)\s*x\s*(\d+)/);
          displays.push({
            name: d._name ?? "Unknown",
            width: resMatch ? parseInt(resMatch[1]) : 0,
            height: resMatch ? parseInt(resMatch[2]) : 0,
            retina_width: pixMatch ? parseInt(pixMatch[1]) : 0,
            retina_height: pixMatch ? parseInt(pixMatch[2]) : 0,
            main: d.spdisplays_main === "spdisplays_yes",
          });
        }
      }

      const main = displays.find((s) => s.main) ?? displays[0];
      if (!main) {
        fail("no displays found");
      }

      ok({ width: main.width, height: main.height, screens: displays });
    } catch (e) {
      fail(`failed to parse display info: ${e}`);
    }
  }
}
