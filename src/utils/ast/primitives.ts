//
// CAPA 1 — Primitivas. ÚNICO archivo que toca la API cruda de ts-morph
// (SyntaxKind, decoradores, navegación de nodos). Las capas 2 y 3 trabajan
// en términos de estas funciones, NO de ts-morph directamente. Si ts-morph
// cambia su API, solo se toca este archivo.

import {
  type SourceFile,
  type Decorator,
  type ObjectLiteralExpression,
  type ArrayLiteralExpression,
  SyntaxKind,
} from "ts-morph";
import type { ImportSpec } from "./interfaces/import-spec.js";
import type { ModuleArrayProperty } from "./interfaces/module-array-property.js";

/**
 * Asegura `import { name } from "moduleSpecifier"` en el archivo.
 * Idempotente: si el import ya existe (mismo módulo), añade solo el named
 * import que falte; si el módulo no está importado, crea la declaración.
 */
export const ensureImport = (source: SourceFile, spec: ImportSpec): void => {
  const { name, moduleSpecifier } = spec;

  const existing = source
    .getImportDeclarations()
    .find((d) => d.getModuleSpecifierValue() === moduleSpecifier);

  if (!existing) {
    source.addImportDeclaration({
      moduleSpecifier: moduleSpecifier,
      namedImports: [name],
    });
    return;
  }

  const alreadyNamed = existing
    .getNamedImports()
    .some((n) => n.getName() === name);

  if (!alreadyNamed) existing.addNamedImport(name);
};

/**
 * Encuentra el decorador @Module (o el que se pida) de la primera clase del
 * archivo. Lanza errores diagnosticables si la estructura no es la esperada.
 */
export const getDecorator = (
  source: SourceFile,
  decoratorName: string,
): Decorator => {
  const cls = source.getClasses()[0];
  if (!cls)
    throw new Error(`No se encontró ninguna clase en ${source.getFilePath()}`);

  const decorator = cls.getDecorator(decoratorName);

  if (!decorator)
    throw new Error(
      `No se encontró el decorador @${decoratorName} en ${source.getFilePath()}`,
    );

  return decorator;
};

/**
 * Devuelve el objeto de configuración de un decorador, ej. el `{...}` de
 * @Module({...}). Lanza si el decorador no recibe un objeto literal.
 */
export const getDecoratorConfig = (
  decorator: Decorator,
): ObjectLiteralExpression => {
  const arg = decorator.getArguments()[0];
  if (!arg || !arg.isKind(SyntaxKind.ObjectLiteralExpression))
    throw new Error(
      `El decorador @${decorator.getName()} no recibe un objeto de configuración`,
    );

  return arg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
};

/**
 * Localiza (o crea vacío) un array dentro de un objeto de configuración.
 * Ej: el array `imports: [...]` del objeto de @Module. Si la propiedad no
 * existe, la crea como `prop: []` y devuelve el array vacío.
 */
export const getOrCreateArray = (
  config: ObjectLiteralExpression,
  property: ModuleArrayProperty,
): ArrayLiteralExpression => {
  if (!config.getProperty(property))
    config.addPropertyAssignment({ name: property, initializer: "[]" });

  const prop = config.getPropertyOrThrow(property);
  const initializer = prop
    .asKindOrThrow(SyntaxKind.PropertyAssignment)
    .getInitializerOrThrow();

  if (!initializer.isKind(SyntaxKind.ArrayLiteralExpression))
    throw new Error(`La propiedad "${property}" del decorador no es un array`);

  return initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
};

/**
 * Añade un elemento (como texto) a un array si no está ya presente.
 * Idempotente: compara por texto normalizado. Sirve tanto para identificadores
 * simples ("AuthService") como para objetos ("{ provide: X, useClass: Y }").
 */
export const addToArrayIfMissing = (
  array: ArrayLiteralExpression,
  elementText: string,
): void => {
  const normalized = elementText.trim();
  const already = array
    .getElements()
    .some((el) => el.getText().trim() === normalized);

  if (!already) array.addElement(normalized);
};
