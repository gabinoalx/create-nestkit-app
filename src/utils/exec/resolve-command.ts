import type { CommandSpec } from '../../interfaces/command-spec.js';
import type { ProjectAnswers } from '../../interfaces/project-answers.js';
import { PM_COMMANDS } from './constants/pm-commands.js';

export const resolveCommand = (
  cmd: CommandSpec,
  packageManager: ProjectAnswers['packageManager'],
): { file: string; args: string[] } => {
  const { run } = cmd;
  if (run === 'bin') return { file: cmd.file, args: [...(cmd.args ?? [])] };
  if (run === 'script')
    return {
      file: packageManager,
      args: ['run', cmd.script, ...(cmd.args ?? [])],
    };
  const {
    dlx: { file, prefixArgs },
  } = PM_COMMANDS[packageManager];
  return {
    file,
    args: [
      ...prefixArgs,
      ...(cmd.autoConfirm ? ['--yes'] : []),
      cmd.package,
      ...(cmd.args ?? []),
    ],
  };
};
