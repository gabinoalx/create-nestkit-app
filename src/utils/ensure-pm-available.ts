import type { ProjectAnswers } from "../interfaces/project-answers.js";
import { runCommand } from "./exec/run-command.js";

export const ensurePackageManagerAvailable = async (
  file: ProjectAnswers["packageManager"],
  targetDir: string,
): Promise<boolean> => {
  try {
    await runCommand(file, ["--version"], {
      cwd: targetDir,
      silent: true,
    });
    return true;
  } catch {
    return false;
  }
};
