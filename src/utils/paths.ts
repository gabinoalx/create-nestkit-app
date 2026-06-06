import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const findPackageRoot = (start: string): string => {
  let dir = start;
  while (!existsSync(join(dir, "package.json"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("No se encontró la raíz del paquete");
    dir = parent;
  }
  return dir;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = findPackageRoot(__dirname);

export const TEMPLATES_DIR = join(PKG_ROOT, "templates");

export const baseTemplateDir = () => join(TEMPLATES_DIR, "base");
export const featureTemplateDir = (name: string) =>
  join(TEMPLATES_DIR, "features", name);
