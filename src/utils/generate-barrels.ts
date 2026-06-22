import type { Dirent } from 'node:fs';
import { readdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const BARREL_EXCLUDE = ['.module.ts', '.spec.ts'];

export const generateBarrels = async (rootDir: string): Promise<void> => {
  const entries = await readdir(rootDir, { withFileTypes: true });

  if (await hasIndexMarker(rootDir)) await writeBarrel(rootDir, entries);

  for (const entry of entries)
    if (entry.isDirectory()) await generateBarrels(join(rootDir, entry.name));
};

const hasIndexMarker = (dir: string): Promise<boolean> =>
  access(join(dir, 'index.ts'))
    .then(() => true)
    .catch(() => false);

const isBarrelable = (name: string): boolean =>
  name.endsWith('.ts') &&
  name !== 'index.ts' &&
  !BARREL_EXCLUDE.some((suffix) => name.endsWith(suffix));

const writeBarrel = async (
  dir: string,
  entries: Dirent<string>[],
): Promise<void> => {
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter(isBarrelable)
    .sort();

  if (files.length === 0) return;

  const lines = files.map((file) => {
    const withoutExt = file.replace(/\.ts$/, '');
    return `export * from './${withoutExt}';`;
  });

  await writeFile(join(dir, 'index.ts'), lines.join('\n') + '\n', 'utf8');
};
