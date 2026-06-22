import { ExecaError } from "execa";
import { runCommand } from "./run-command.js";
import type { ProjectAnswers } from "../../interfaces/project-answers.js";
import type { DependencySpec } from "../../interfaces/dependency-spec.js";
import { PM_COMMANDS } from "./constants/pm-commands.js";

export const runInstallDependencies = async (
  answers: ProjectAnswers,
  collectedDeps: DependencySpec[],
): Promise<void> => {
  const { packageManager, targetDir } = answers;

  const {
    add: { file, subcommand, devFlag },
  } = PM_COMMANDS[packageManager];

  let needsApproveBuilds: boolean = false;

  const prodDeps = collectedDeps
    .filter(({ dev }) => !dev)
    .map(({ name }) => name);

  const devDeps = collectedDeps
    .filter(({ dev }) => dev)
    .map(({ name }) => name);

  const packageInstallCommands: { file: string; args: string[] }[] = [
    ...(prodDeps.length ? [{ file, args: [subcommand, ...prodDeps] }] : []),
    ...(devDeps.length
      ? [{ file, args: [subcommand, devFlag, ...devDeps] }]
      : []),
  ];

  for (const { file, args } of packageInstallCommands) {
    try {
      await runCommand(file, args, { cwd: targetDir });
    } catch (error: unknown) {
      if (!(error instanceof ExecaError)) throw error;
      if (packageManager === "pnpm") {
        const ignoredBuildsInErrors = (error.all || []).some(
          (e: string | undefined) => e?.includes("ERR_PNPM_IGNORED_BUILDS"),
        );
        if (ignoredBuildsInErrors) {
          needsApproveBuilds = true;
          continue;
        }
      }
      throw error;
    }
  }

  if (needsApproveBuilds)
    await runCommand(packageManager, ["approve-builds"], {
      cwd: targetDir,
      interactive: true,
    });
};
