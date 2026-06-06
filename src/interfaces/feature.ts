import type { CommandSpec } from "./command-spec.js";
import type { DependencySpec } from "./dependency-spec.js";
import type { EnvVar } from "./env-var.js";
import type { ScaffoldContext } from "./scaff-context.js";

/** El contrato que toda feature debe cumplir. */
export interface Feature {
  /** Identificador único, coincide con la carpeta en templates/features/. */
  readonly id: Lowercase<string>;

  /** Nombre legible que se muestra en los prompts. */
  readonly label: string;

  /** Dependencias que esta feature añade. Declarativo. */
  readonly dependencies?: readonly DependencySpec[];

  /**
   * Carpeta dentro de templates/features/ cuyos archivos se copian
   * al proyecto. Si se omite, la feature no copia archivos.
   */
  readonly templateDir?: Lowercase<string>;

  /** Comandos que corren ANTES de instalar deps (ej. prisma init). */
  readonly commandsBeforeInstall?: readonly CommandSpec[];

  /** Comandos que corren DESPUÉS de instalar deps (ej. prisma generate). */
  readonly commandsAfterInstall?: readonly CommandSpec[];

  readonly scripts?: Readonly<Record<string, string>>;

  readonly tsconfigPaths?: Readonly<Record<string, string[]>>;

  readonly envs?: readonly EnvVar[];
  /**
   * Modificaciones de código que requieren lógica (AST, merges).
   * Recibe el contexto y opera sobre él. Opcional: muchas
   * features solo copian archivos y añaden deps.
   */
  apply?(ctx: ScaffoldContext): void | Promise<void>;
}
