import type { ProjectAnswers } from '../../../interfaces/project-answers.js';

export const PM_COMMANDS: Record<
  ProjectAnswers['packageManager'],
  {
    dlx: { file: string; prefixArgs: readonly string[] };
    add: { file: string; subcommand: string; devFlag: string };
    exec: { file: string; prefixArgs: readonly string[] };
  }
> = {
  npm: {
    dlx: { file: 'npx', prefixArgs: [] },
    add: { file: 'npm', subcommand: 'install', devFlag: '-D' },
    exec: { file: 'npx', prefixArgs: [] },
  },
  pnpm: {
    dlx: { file: 'pnpm', prefixArgs: ['dlx'] },
    add: { file: 'pnpm', subcommand: 'add', devFlag: '-D' },
    exec: { file: 'pnpm', prefixArgs: ['exec'] },
  },
  yarn: {
    dlx: { file: 'yarn', prefixArgs: ['dlx'] },
    add: { file: 'yarn', subcommand: 'add', devFlag: '-D' },
    exec: { file: 'yarn', prefixArgs: ['exec'] },
  },
};
