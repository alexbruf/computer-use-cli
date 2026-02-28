let jsonMode = false;

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled;
}

function formatHuman(data: unknown): string {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const lines: string[] = [];

    for (const [k, v] of Object.entries(obj)) {
      // Skip dumping base64 blobs to terminal
      if (k === "base64_image" && typeof v === "string") {
        lines.push(`${k}: [${v.length} chars]`);
        continue;
      }

      if (Array.isArray(v)) {
        lines.push(`${k}:`);
        for (const item of v) {
          if (typeof item === "object" && item != null) {
            const parts = Object.entries(item as Record<string, unknown>)
              .map(([ik, iv]) => `${ik}=${iv}`)
              .join("  ");
            lines.push(`  - ${parts}`);
          } else {
            lines.push(`  - ${item}`);
          }
        }
      } else if (typeof v === "object" && v != null) {
        lines.push(`${k}: ${JSON.stringify(v)}`);
      } else {
        lines.push(`${k}: ${v}`);
      }
    }

    return lines.join("\n");
  }

  return String(data);
}

export function ok(data: unknown): never {
  if (jsonMode) {
    console.log(JSON.stringify({ success: true, data, error: null }));
  } else {
    const output = formatHuman(data);
    if (output) console.log(output);
  }
  process.exit(0);
}

export function fail(error: string, exitCode = 1): never {
  if (jsonMode) {
    console.log(JSON.stringify({ success: false, data: null, error }));
  } else {
    console.error(`Error: ${error}`);
  }
  process.exit(exitCode);
}
