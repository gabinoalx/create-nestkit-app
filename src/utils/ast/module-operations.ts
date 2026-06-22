import type { ArrayLiteralExpression, SourceFile } from 'ts-morph';
import {
  ensureImport,
  getDecorator,
  getDecoratorConfig,
  getOrCreateArray,
  addToArrayIfMissing,
} from './primitives.js';
import type { ImportSpec } from './interfaces/import-spec.js';
import type { ProviderSpec } from './interfaces/provider-spec.js';
import type { ModuleArrayProperty } from './interfaces/module-array-property.js';

const moduleArray = (
  source: SourceFile,
  property: ModuleArrayProperty,
): ArrayLiteralExpression => {
  const decorator = getDecorator(source, 'Module');
  const config = getDecoratorConfig(decorator);
  return getOrCreateArray(config, property);
};

export const addToImports = (source: SourceFile, spec: ImportSpec): void => {
  ensureImport(source, spec);
  const array = moduleArray(source, 'imports');
  addToArrayIfMissing(array, spec.name, spec.position);
};

export const addToExports = (source: SourceFile, spec: ImportSpec): void => {
  ensureImport(source, spec);
  const array = moduleArray(source, 'exports');
  addToArrayIfMissing(array, spec.name, spec.position);
};

export const addToControllers = (
  source: SourceFile,
  spec: ImportSpec,
): void => {
  ensureImport(source, spec);
  const array = moduleArray(source, 'controllers');
  addToArrayIfMissing(array, spec.name, spec.position);
};

export const addToProviders = (
  source: SourceFile,
  provider: ProviderSpec,
): void => {
  const array = moduleArray(source, 'providers');
  switch (provider.kind) {
    case 'class': {
      const { className, importPath, position } = provider;
      ensureImport(source, {
        name: className,
        moduleSpecifier: importPath,
      });
      addToArrayIfMissing(array, className, position);
      return;
    }

    case 'useClass': {
      const { className, importPath, provideImport, provide, position } =
        provider;
      ensureImport(source, {
        name: className,
        moduleSpecifier: importPath,
      });
      if (provideImport) ensureImport(source, provideImport);
      addToArrayIfMissing(
        array,
        `{ 
           provide: ${provide}, 
           useClass: ${className}
         }`,
        position,
      );
      return;
    }

    case 'useValue': {
      const { provideImport, imports, provide, value, position } = provider;
      if (provideImport) ensureImport(source, provideImport);
      for (const imp of imports ?? []) ensureImport(source, imp);
      addToArrayIfMissing(
        array,
        `{ 
           provide: ${provide}, 
           useValue: ${value}
         }`,
        position,
      );
      return;
    }

    case 'useFactory': {
      const { provide, provideImport, factory, imports, inject, position } =
        provider;
      if (provideImport) ensureImport(source, provideImport);
      for (const imp of imports ?? []) ensureImport(source, imp);
      const haveInject = inject?.length
        ? `, inject: [${inject.join(', ')}]`
        : '';
      addToArrayIfMissing(
        array,
        `{ 
          provide: ${provide}, 
          useFactory: ${factory}${haveInject}
         }`,
        position,
      );
      return;
    }
  }
};
