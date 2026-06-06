// src/utils/ast/module-operations.ts
//
// CAPA 2 — Operaciones sobre un módulo. Combinan las primitivas (capa 1) para
// añadir algo al array de un @Module asegurando su(s) import(s). NO tocan
// ts-morph crudo: todo pasa por primitives.ts.

import type { ArrayLiteralExpression, SourceFile } from "ts-morph";
import {
  ensureImport,
  getDecorator,
  getDecoratorConfig,
  getOrCreateArray,
  addToArrayIfMissing,
} from "./primitives.js";
import type { ImportSpec } from "./interfaces/import-spec.js";
import type { ProviderSpec } from "./interfaces/provider-spec.js";
import type { ModuleArrayProperty } from "./interfaces/module-array-property.js";

/**
 * Helper interno: localiza el array `property` del @Module del archivo.
 * Encapsula la secuencia decorator → config → array que comparten todas
 * las operaciones de esta capa.
 */
const moduleArray = (
  source: SourceFile,
  property: ModuleArrayProperty,
): ArrayLiteralExpression => {
  const decorator = getDecorator(source, "Module");
  const config = getDecoratorConfig(decorator);
  return getOrCreateArray(config, property);
};

/**
 * Añade una clase-módulo al array `imports` del @Module, asegurando su import.
 * Ej: AuthModule → `imports: [..., AuthModule]` + `import { AuthModule } from ...`.
 */
export const addToImports = (source: SourceFile, spec: ImportSpec): void => {
  ensureImport(source, spec);
  const array = moduleArray(source, "imports");
  addToArrayIfMissing(array, spec.name);
};

/**
 * Añade una clase al array `exports` del @Module, asegurando su import.
 */
export const addToExports = (source: SourceFile, spec: ImportSpec): void => {
  ensureImport(source, spec);
  const array = moduleArray(source, "exports");
  addToArrayIfMissing(array, spec.name);
};

/**
 * Añade un controlador al array `controllers` del @Module, asegurando su import.
 */
export const addToControllers = (
  source: SourceFile,
  spec: ImportSpec,
): void => {
  ensureImport(source, spec);
  const array = moduleArray(source, "controllers");
  addToArrayIfMissing(array, spec.name);
};

/**
 * Añade un provider al array `providers` del @Module. Soporta las cuatro formas
 * de NestJS según `provider.kind`. Asegura todos los imports que la forma
 * necesita antes de insertar el elemento.
 */
export const addToProviders = (
  source: SourceFile,
  provider: ProviderSpec,
): void => {
  const array = moduleArray(source, "providers");
  switch (provider.kind) {
    case "class": {
      const { className, importPath } = provider;
      ensureImport(source, {
        name: className,
        moduleSpecifier: importPath,
      });
      addToArrayIfMissing(array, className);
      return;
    }

    case "useClass": {
      const { className, importPath, provideImport, provide } = provider;
      ensureImport(source, {
        name: className,
        moduleSpecifier: importPath,
      });
      if (provideImport) ensureImport(source, provideImport);
      addToArrayIfMissing(
        array,
        `{ provide: ${provide}, useClass: ${className} }`,
      );
      return;
    }

    case "useValue": {
      const { provideImport, imports, provide, value } = provider;
      if (provideImport) ensureImport(source, provideImport);
      for (const imp of imports ?? []) ensureImport(source, imp);
      addToArrayIfMissing(array, `{ provide: ${provide}, useValue: ${value} }`);
      return;
    }

    case "useFactory": {
      const { provide, provideImport, factory, imports, inject } = provider;
      if (provideImport) ensureImport(source, provideImport);
      for (const imp of imports ?? []) ensureImport(source, imp);
      const haveInject = inject?.length
        ? `, inject: [${inject.join(", ")}]`
        : "";
      addToArrayIfMissing(
        array,
        `{ provide: ${provide}, useFactory: ${factory}${haveInject} }`,
      );
      return;
    }
  }
};
