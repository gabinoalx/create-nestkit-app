import { execa } from "execa";
import type { RunOptions } from "../../interfaces/run-options.js";

export const runCommand = (
  file: string,
  args: readonly string[],
  options: RunOptions,
) => {
  const {
    cwd,
    timeout = 2 * 60 * 1000,
    env,
    silent = false,
    interactive = false,
  } = options;

  if (interactive)
    return execa(file, args, {
      cwd,
      timeout,
      ...(env && { env: { ...process.env, ...env } }),
      stdio: "inherit",
    });

  return execa(file, args, {
    cwd,
    timeout,
    ...(env && { env: { ...process.env, ...env } }),
    stdout: silent ? "pipe" : ["pipe", "inherit"],
    stderr: silent ? "pipe" : ["pipe", "inherit"],
    lines: true as const,
    all: true as const,
  });
};
