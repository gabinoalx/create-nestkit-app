// src/utils/ast/env-schema.ts
//
// CAPA 1 (primitiva) — añade propiedades al z.object del env.schema.ts.
// Recibe EnvVar (definido en el modelo de Feature), no lo define.

import { Project, SyntaxKind } from "ts-morph";
import type { EnvVar } from "../../interfaces/env-var.js";

/**
 * Añade las variables al z.object del schema de envs (idempotente).
 * @param source     SourceFile del env.schema.ts (ya en el project).
 * @param schemaVar  Nombre de la const del schema, ej. "envSchema".
 * @param vars       Variables a añadir (usa key + schema).
 */
export const addToEnvSchema = (
  project: Project,
  filePath: string,
  schemaVar: string,
  vars: readonly EnvVar[],
): void => {
  const source = project.addSourceFileAtPath(filePath);
  const decl = source.getVariableDeclarationOrThrow(schemaVar);
  const initializer = decl.getInitializerOrThrow();

  const call = initializer.asKindOrThrow(SyntaxKind.CallExpression);
  const objArg = call.getArguments()[0];
  if (!objArg || !objArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
    throw new Error(`${schemaVar} no es un z.object({...}) con objeto literal`);
  }
  const obj = objArg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  for (const v of vars) {
    if (obj.getProperty(v.key)) continue; // idempotente por nombre de propiedad
    obj.addPropertyAssignment({ name: v.key, initializer: v.schema });
  }
};
