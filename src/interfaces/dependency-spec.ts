/** Una dependencia a añadir al package.json del proyecto generado. */
export interface DependencySpec {
  name: string;
  /** "latest" por defecto: deja que el install resuelva la versión fresca. */
  version?: string;
  /** true → devDependencies, false/undefined → dependencies. */
  dev?: boolean;
}
