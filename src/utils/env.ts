// src/utils/env.ts
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import type { EnvVar } from "../interfaces/env-var.js";

/**
 * Añade variables al .env.example del proyecto generado (texto KEY=VALUE).
 * No pisa las claves ya presentes (las del template base mandan). Cada variable
 * se escribe como `KEY=example`, precedida de su comentario `# ...` si lo tiene.
 *
 * @param targetDir  Raíz del proyecto generado.
 * @param vars       Variables recolectadas de las features (ya sin colisiones entre sí).
 */
export const mergeEnvs = async (
  targetDir: string,
  vars: readonly EnvVar[],
): Promise<void> => {
  if (vars.length === 0) return;

  const envPath = join(targetDir, ".env");

  // El archivo puede no existir todavía → partir de cadena vacía.
  let content = await readFile(envPath, "utf8").catch(() => "");

  // Claves ya presentes: leer las líneas "KEY=..." (ignorando comentarios/vacías).
  const existingKeys = new Set(
    content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=")[0]?.trim())
      .filter((key): key is string => Boolean(key)),
  );

  const blocks: string[] = [];
  for (const v of vars) {
    if (existingKeys.has(v.key)) continue; // ya está, no pisar

    const lines: string[] = [];
    if (v.comment) lines.push(`# ${v.comment}`);
    lines.push(`${v.key}=${v.example}`);
    blocks.push(lines.join("\n"));
  }

  if (blocks.length === 0) return; // todo ya estaba

  // Asegurar separación: si había contenido, una línea en blanco entre lo viejo y lo nuevo.
  const trimmed = content.replace(/\n+$/, "");
  const prefix = trimmed ? `${trimmed}\n\n` : "";
  content = `${prefix}${blocks.join("\n\n")}\n`;

  await writeFile(envPath, content, "utf8");
};
