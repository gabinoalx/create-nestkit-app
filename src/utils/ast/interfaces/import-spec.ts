import type { IdentifierInsertPosition } from './insert-position.js';

export interface ImportSpec {
  name: string;
  moduleSpecifier: string;
  position?: IdentifierInsertPosition;
}
