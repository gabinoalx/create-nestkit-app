import {
  type SourceFile,
  type Decorator,
  type ObjectLiteralExpression,
  type ArrayLiteralExpression,
  SyntaxKind,
  Node,
} from 'ts-morph';
import type { ImportSpec } from './interfaces/import-spec.js';
import type { ModuleArrayProperty } from './interfaces/module-array-property.js';
import type {
  IdentifierMatcher,
  InsertPosition,
  ObjectMatcher,
} from './interfaces/insert-position.js';

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

export const getOrCreateArray = (
  config: ObjectLiteralExpression,
  property: ModuleArrayProperty,
): ArrayLiteralExpression => {
  if (!config.getProperty(property))
    config.addPropertyAssignment({ name: property, initializer: '[]' });

  const prop = config.getPropertyOrThrow(property);
  const initializer = prop
    .asKindOrThrow(SyntaxKind.PropertyAssignment)
    .getInitializerOrThrow();

  if (!initializer.isKind(SyntaxKind.ArrayLiteralExpression))
    throw new Error(`La propiedad "${property}" del decorador no es un array`);

  return initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
};

export const addToArrayIfMissing = <
  M extends IdentifierMatcher | ObjectMatcher,
>(
  array: ArrayLiteralExpression,
  elementText: string,
  position: InsertPosition<M> = 'end',
): void => {
  const elements = array.getElements();
  if (elements.some((el) => el.getText().trim() === elementText.trim())) return;

  const index = resolveInsertIndex(elements, position);
  array.insertElement(index, elementText);
};

export const resolveInsertIndex = <M extends IdentifierMatcher | ObjectMatcher>(
  elements: readonly Node[],
  position: InsertPosition<M>,
): number => {
  if (position === 'end') return elements.length;
  if (position === 'start') return 0;

  const matcher = 'after' in position ? position.after : position.before;
  const refIndex = elements.findIndex((el) => matchElement(el, matcher));

  if (refIndex === -1)
    throw new Error(
      `No se encontró el elemento de referencia: ${JSON.stringify(matcher)}`,
    );
  return 'after' in position ? refIndex + 1 : refIndex;
};

const matchElement = (
  el: Node,
  matcher: IdentifierMatcher | ObjectMatcher,
): boolean => {
  if ('name' in matcher) return el.getText().trim() === matcher.name;

  if (!el.isKind(SyntaxKind.ObjectLiteralExpression)) return false;
  const prop = el
    .asKind(SyntaxKind.ObjectLiteralExpression)
    ?.getProperty(matcher.property);
  if (!prop?.isKind(SyntaxKind.PropertyAssignment)) return false;
  return prop.getInitializer()?.getText().trim() === matcher.equals;
};
