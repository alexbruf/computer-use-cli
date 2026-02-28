export interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export async function run(
  cmd: string[],
  options?: { timeout?: number; cwd?: string }
): Promise<RunResult> {
  const timeout = options?.timeout ?? 10_000;

  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
    cwd: options?.cwd,
  });

  const timer = setTimeout(() => proc.kill(), timeout);

  try {
    const [exitCode, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    clearTimeout(timer);
    return {
      exitCode,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      timedOut: false,
    };
  } catch {
    clearTimeout(timer);
    return { exitCode: -1, stdout: "", stderr: "process failed", timedOut: true };
  }
}
