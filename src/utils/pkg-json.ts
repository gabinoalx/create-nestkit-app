import { join } from 'node:path';
import type { PackageJson } from '../interfaces/package-json.js';
import { readJson, writeJson } from './json.js';

export const mergeScripts = async (
  targetDir: string,
  scripts: Readonly<Record<string, string>>,
): Promise<void> => {
  if (Object.keys(scripts).length === 0) return;

  const pkgPath = join(targetDir, 'package.json');
  const pkg: PackageJson = await readJson(pkgPath);

  const existing: Record<string, string> = { ...(pkg['scripts'] ?? {}) };

  for (const [name, command] of Object.entries(scripts)) {
    if (existing[name] === undefined) existing[name] = command;
    else
      throw new Error(
        `El script "${name}" ya existe, Renombra uno de los dos script.`,
      );
  }

  pkg['scripts'] = existing;
  await writeJson(pkgPath, pkg as Record<string, string>);
};
