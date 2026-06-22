import type { Project, SourceFile } from 'ts-morph';
import {
  addToImports,
  addToProviders,
  addToExports,
  addToControllers,
} from './module-operations.js';
import type { ModuleModification } from './interfaces/module-modification.js';

export const modifyNestModule = (
  project: Project,
  modulePath: string,
  mod: ModuleModification,
): void => {
  const source: SourceFile =
    project.getSourceFile(modulePath) ??
    project.addSourceFileAtPath(modulePath);
  for (const spec of mod.imports ?? []) addToImports(source, spec);
  for (const provider of mod.providers ?? []) addToProviders(source, provider);
  for (const spec of mod.exports ?? []) addToExports(source, spec);
  for (const spec of mod.controllers ?? []) addToControllers(source, spec);
};
