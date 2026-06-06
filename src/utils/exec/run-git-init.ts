import { runCommand } from "./run-command.js";

export const runGitInit = async (targetDir: string): Promise<void> => {
  await runCommand("git", ["init"], { cwd: targetDir });
};
