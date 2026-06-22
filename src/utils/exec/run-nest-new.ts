import type { ProjectAnswers } from "../../interfaces/project-answers.js";
import { getParentDir } from "../get-parent-dir.js";
import { PM_COMMANDS } from "./constants/pm-commands.js";
import { runCommand } from "./run-command.js";

export const runNestNew = async (answers: ProjectAnswers): Promise<void> => {
  const { projectName, packageManager, targetDir } = answers;
  const {
    dlx: { file, prefixArgs },
  } = PM_COMMANDS[packageManager];

  await runCommand(
    file,
    [
      ...prefixArgs,
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
