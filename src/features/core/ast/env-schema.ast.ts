import type { Project } from "ts-morph";
import { ensureImport } from "../../../utils/ast/primitives.js";

export const configureEnvSchema = (
  project: Project,
  filePath: string,
): void => {
  const source =
    project.getSourceFile(filePath) ?? project.addSourceFileAtPath(filePath);
  for (const spec of [
    { name: "LEVELS_LOGGER", moduleSpecifier: "@config/logger" },
  ])
    ensureImport(source, spec);
};
