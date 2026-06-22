import { Project, SyntaxKind } from 'ts-morph';
import type { EnvVar } from '../../interfaces/env-var.js';

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
    if (obj.getProperty(v.key)) continue;
    obj.addPropertyAssignment({ name: v.key, initializer: v.schema });
  }
};
