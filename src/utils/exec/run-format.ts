import type { Project } from 'ts-morph';
import { PM_COMMANDS } from './constants/pm-commands.js';
import { join } from 'node:path';
import { runCommand } from './run-command.js';
import type { ProjectAnswers } from '../../interfaces/project-answers';
import { existsSync } from 'node:fs';

export const runFormat = async (
  targetDir: string,
  project: Project,
  packageManager: ProjectAnswers['packageManager'],
): Promise<void> => {
  const tsFiles = project.getSourceFiles().map((f) => f.getFilePath());

  const jsonFiles = [
    join(targetDir, 'tsconfig.json'),
    join(targetDir, 'tsconfig.build.json'),
  ].filter(existsSync);

  const filesToFormat = [...tsFiles, ...jsonFiles];
  if (filesToFormat.length === 0) return;

  const {
    exec: { file, prefixArgs },
  } = PM_COMMANDS[packageManager];
  await runCommand(
    file,
    [...prefixArgs, 'prettier', '--write', ...filesToFormat],
    { cwd: targetDir },
  );
};
