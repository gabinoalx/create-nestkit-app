/**
 * Un import a asegurar en un archivo: `import { name } from "moduleSpecifier"`.
 * El nombre es REQUERIDO (no se infiere del nombre de archivo — ver decisión 2.x).
 */
export interface ImportSpec {
  /** Nombre del símbolo importado, ej. "AuthModule", "ConfigService". */
  name: string;
  /** Ruta del módulo, ej. "./auth/auth.module". */
  moduleSpecifier: string;
}
