import { join } from "node:path";
import type { PackageJson } from "../interfaces/package-json.js";
import { readJson, writeJson } from "./json.js";
import type { DependencySpec } from "../interfaces/dependency-spec.js";

export const mergeDependencies = async (
  targetDir: string,
  specs: readonly DependencySpec[],
): Promise<void> => {
  if (specs.length === 0) return;

  const pkgPath = join(targetDir, "package.json");
  const pkg: PackageJson = await readJson(pkgPath);

  const deps = { ...(pkg.dependencies ?? {}) };
  const devDeps = { ...(pkg.devDependencies ?? {}) };

  for (const spec of specs) {
    const { dev, name, version } = spec;
    const target = dev ? devDeps : deps;
    if (target[name] === undefined) target[name] = version ?? "latest";
  }

  pkg.dependencies = sortKeys(deps);
  pkg.devDependencies = sortKeys(devDeps);

  await writeJson(pkgPath, pkg as Record<string, string>);
};

/** Devuelve un nuevo objeto con las claves ordenadas alfabéticamente. */
const sortKeys = (obj: Record<string, string>): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
};

export const mergeScripts = async (
  targetDir: string,
  scripts: Readonly<Record<string, string>>,
): Promise<void> => {
  if (Object.keys(scripts).length === 0) return;

  const pkgPath = join(targetDir, "package.json");
  const pkg: PackageJson = await readJson(pkgPath);

  const existing: Record<string, string> = { ...(pkg["scripts"] ?? {}) };

  for (const [name, command] of Object.entries(scripts)) {
    if (existing[name] === undefined) existing[name] = command;
    else
      throw new Error(
        `El script "${name}" ya existe, Renombra uno de los dos script.`,
      );
  }

  pkg["scripts"] = existing;
  await writeJson(pkgPath, pkg as Record<string, string>);
};
