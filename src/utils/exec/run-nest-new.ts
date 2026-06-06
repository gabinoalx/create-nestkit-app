import type { ProjectAnswers } from "../../interfaces/project-answers.js";
import { getParentDir } from "../get-parent-dir.js";
import { runCommand } from "./run-command.js";

export const runNestNew = async (answers: ProjectAnswers): Promise<void> => {
  const { projectName, packageManager, targetDir } = answers;
  await runCommand(
    "npx",
    [
      "--yes",
      "@nestjs/cli",
      "new",
      projectName,
      "--strict",
      "--skip-install",
      "--skip-git",
      "--package-manager",
      packageManager,
    ],
    {
      cwd: getParentDir(targetDir),
    },
  );
};
