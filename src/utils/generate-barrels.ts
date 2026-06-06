import type { Dirent } from "node:fs";
import { readdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const BARREL_EXCLUDE = [".module.ts", ".spec.ts"];
/**
 * Rellena los barrels (index.ts) del proyecto. Una carpeta recibe barrel solo
 * si YA contiene un index.ts (marcador dejado en el template). Recorre todo el
 * árbol, así funciona a cualquier profundidad.
 * Debe correr DESPUÉS de copiar base + features y de los apply, para reflejar
 * los archivos finales.
 */
export const generateBarrels = async (rootDir: string): Promise<void> => {
  const entries = await readdir(rootDir, { withFileTypes: true });

  // Si esta carpeta tiene index.ts marcador, rellenarlo.
  if (await hasIndexMarker(rootDir)) await writeBarrel(rootDir, entries);

  // Recorrer subcarpetas (también pueden tener su propio marcador).
  for (const entry of entries)
    if (entry.isDirectory()) await generateBarrels(join(rootDir, entry.name));
};

const hasIndexMarker = (dir: string): Promise<boolean> =>
  access(join(dir, "index.ts"))
    .then(() => true)
    .catch(() => false);

const isBarrelable = (name: string): boolean =>
  name.endsWith(".ts") &&
  name !== "index.ts" &&
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

  if (files.length === 0) return; // nada que exportar; deja el marcador vacío

  const lines = files.map((file) => {
    const withoutExt = file.replace(/\.ts$/, "");
    return `export * from './${withoutExt}';`;
  });

  await writeFile(join(dir, "index.ts"), lines.join("\n") + "\n", "utf8");
};
