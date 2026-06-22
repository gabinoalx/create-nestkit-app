import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { EnvVar } from '../interfaces/env-var.js';

export const mergeEnvs = async (
  targetDir: string,
  groups: readonly (readonly EnvVar[])[],
): Promise<void> => {
  if (groups.length === 0) return;

  const envPath = join(targetDir, '.env');

  const blocks: string[] = [];
  for (const group of groups) {
    const groupLines: string[] = [];
    for (const v of group) {
      if (v.comment) groupLines.push(`# ${v.comment}`);
      groupLines.push(`${v.key}=${v.example}`);
    }
    if (groupLines.length > 0) blocks.push(groupLines.join('\n'));
  }

  if (blocks.length === 0) return;

  await writeFile(envPath, blocks.join('\n\n') + '\n', 'utf8');
};
