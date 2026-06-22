import type { CommandSpec } from './command-spec.js';
import type { DependencySpec } from './dependency-spec.js';
import type { EnvVar } from './env-var.js';
import type { ScaffoldContext } from './scaff-context.js';

export interface Feature {
  readonly id: Lowercase<string>;
  readonly label: string;
  readonly dependencies?: readonly DependencySpec[];
  readonly templateDir?: Lowercase<string>;
  readonly setupCommands?: readonly CommandSpec[];
  readonly commandsBeforeInstall?: readonly CommandSpec[];
  readonly commandsAfterInstall?: readonly CommandSpec[];
  readonly scripts?: Readonly<Record<string, string>>;
  readonly tsconfigPaths?: Readonly<Record<string, string[]>>;
  readonly envs?: readonly EnvVar[];
  apply?(ctx: ScaffoldContext): void | Promise<void>;
}
