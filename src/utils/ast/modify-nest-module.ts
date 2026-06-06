// src/utils/ast/index.ts
import type { Project, SourceFile } from "ts-morph";
import {
  addToImports,
  addToProviders,
  addToExports,
  addToControllers,
} from "./module-operations.js";
import type { ModuleModification } from "./interfaces/module-modification.js";

/** Lo que se puede añadir a un @Module en una sola pasada. Todo opcional. */

/**
 * CAPA 3 — Modifica el @Module de un archivo: añade imports, providers, exports
 * y/o controllers en una sola pasada. Abre el archivo UNA vez y delega cada
 * parte en la capa 2. Idempotente (cada operación lo es).
 *
 * @param project     Project de ts-morph compartido por el scaffolder.
 * @param modulePath  Ruta absoluta al .module.ts a modificar.
 * @param mod         Qué añadir (cualquier combinación de arrays).
 */
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
