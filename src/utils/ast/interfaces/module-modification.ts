import type { ImportSpec } from "./import-spec";
import type { ProviderSpec } from "./provider-spec";

export interface ModuleModification {
  imports?: ImportSpec[];
  providers?: ProviderSpec[];
  exports?: ImportSpec[];
  controllers?: ImportSpec[];
}
