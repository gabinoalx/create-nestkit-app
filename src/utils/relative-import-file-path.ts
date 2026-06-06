// src/utils/ast/relative-import.ts
import { dirname, relative, sep } from "node:path";

/**
 * Calcula el especificador de import relativo para usar en un `from "..."`,
 * dado el archivo que importa y el archivo importado (ambos rutas absolutas).
 *
 * Resuelve las trampas de path.relative:
 *  - parte de la CARPETA del archivo que importa (no del archivo),
 *  - quita la extensión .ts (los imports no la llevan),
 *  - fuerza prefijo "./" cuando queda en la misma carpeta o subcarpeta,
 *  - normaliza separadores a "/" (Windows usa "\").
 *
 * @param fromFile  Ruta absoluta del archivo que CONTIENE el import (ej. filters.module.ts).
 * @param toFile    Ruta absoluta del archivo IMPORTADO (ej. prisma-exception.filter.ts).
 * @returns         Texto para `from`, ej. "./prisma-exception.filter".
 */
export const relativeImportFilePath = (
  fromFile: string,
  toFile: string,
): string => {
  if (!fromFile || !toFile)
    throw new Error(
      `relativeImportPath: paths cannot be empty. Got fromFile="${fromFile}", toFile="${toFile}"`,
    );

  // 1. relative trabaja entre carpetas → usar la carpeta del que importa.
  let rel = relative(dirname(fromFile), toFile);

  // 2. normalizar separadores a "/" (portabilidad Windows).
  rel = rel.split(sep).join("/");

  // 3. quitar la extensión .ts (también .tsx por si acaso).
  rel = rel
    .replace(/\.d\.ts$/, "") // primero .d.ts (más específico)
    .replace(/\.tsx?$/, ""); // luego .ts / .tsx

  // 4. forzar "./" si no empieza ya con "./" o "../".
  if (!rel.startsWith(".")) rel = `./${rel}`;

  return rel;
};
// const filtersModulePath = join(targetDir, "src", "core", "filters", "filters.module.ts");
// const filterPath = join(targetDir, "src", "core", "filters", "prisma-exception.filter.ts");

// modifyModule(project, filtersModulePath, {
//   providers: [{
//     kind: "useClass",
//     provide: "APP_FILTER",
//     className: "PrismaExceptionFilter",
//     importPath: relativeImportPath(filtersModulePath, filterPath),
//     provideImport: { name: "APP_FILTER", moduleSpecifier: "@nestjs/core" },
//   }],
// });
