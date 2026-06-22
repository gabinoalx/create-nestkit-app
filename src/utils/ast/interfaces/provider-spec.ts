import type { ImportSpec } from './import-spec.js';
import type { ObjectInsertPosition } from './insert-position.js';

/**
 * Las cuatro formas de declarar un provider en NestJS.
 * Discriminadas por `kind` para que TypeScript sepa qué campos aplican.
 */
export type ProviderSpec =
  // 1. Clase directa: `providers: [AuthService]`
  | {
      kind: 'class';
      className: string;
      importPath: string;
      position?: ObjectInsertPosition;
    }
  // 2. useClass: `{ provide: TOKEN, useClass: AuthService }`
  | {
      kind: 'useClass';
      provide: string; // token (string literal o identificador ya importado)
      className: string;
      importPath: string;
      /** Si `provide` es un símbolo importado (no string literal), su import. */
      provideImport?: ImportSpec;
      position?: ObjectInsertPosition;
    }
  // 3. useValue: `{ provide: TOKEN, useValue: <expr> }`
  | {
      kind: 'useValue';
      provide: string;
      /** Código de la expresión del valor, como texto. Ej: "{ timeout: 5000 }". */
      value: string;
      provideImport?: ImportSpec;
      /** Imports que la expresión `value` necesita. */
      imports?: ImportSpec[];
      position?: ObjectInsertPosition;
    }
  // 4. useFactory: `{ provide: TOKEN, useFactory: (...) => ..., inject: [...] }`
  | {
      kind: 'useFactory';
      provide: string;
      /** Código de la función factory, como texto. Ej: "(c) => new Thing(c)". */
      factory: string;
      /** Nombres de los símbolos a inyectar (deben venir en `imports`). */
      inject?: string[];
      provideImport?: ImportSpec;
      /** Imports que factory/inject necesitan. */
      imports?: ImportSpec[];
      position?: ObjectInsertPosition;
    };
