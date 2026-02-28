/**
 * Extract a flag value from args array.
 * e.g. extractFlag(["500", "300", "--button", "right"], "--button") => "right"
 */
export function extractFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

export function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}
