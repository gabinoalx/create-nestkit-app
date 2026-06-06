import { ExecaError } from "execa";
import { runCommand } from "./run-command.js";
import type { ProjectAnswers } from "../../interfaces/project-answers.js";

export const runInstall = async (answers: ProjectAnswers): Promise<void> => {
  const { packageManager, targetDir } = answers;
  try {
    await runCommand(packageManager, ["install"], {
      cwd: targetDir,
    });
  } catch (error: unknown) {
    if (!(error instanceof ExecaError)) throw error;
    if (packageManager === "pnpm") {
      const ignoredBuildsInErrors = (error.all || []).some(
        (e: string | undefined) => e?.includes("ERR_PNPM_IGNORED_BUILDS"),
      );
      if (ignoredBuildsInErrors) {
        await runCommand(packageManager, ["approve-builds"], {
          cwd: targetDir,
          interactive: true,
        });
        return;
      }
    }
  }
};
