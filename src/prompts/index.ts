import { join } from "node:path";
import {
  intro,
  outro,
  text,
  select,
  multiselect,
  isCancel,
  cancel,
} from "@clack/prompts";
import { validateProjectName } from "./validations/validate-project-name.js";
import { OPTIONAL_FEATURES } from "../features/index.js";
import fs from "fs-extra";
import { ensurePackageManagerAvailable } from "../utils/ensure-pm-available.js";
import type { ProjectAnswers } from "../interfaces/project-answers.js";

export const collectAnswers = async (): Promise<ProjectAnswers> => {
  intro("create-nestjs-app");

  const projectName = await text({
    message: "What is the name of the project?",
    placeholder: "my-nest-app",
    validate: validateProjectName,
  });

  ensureNotCancelled(projectName);

  const targetDir = join(process.cwd(), projectName);

  const dirExists = await fs.pathExists(targetDir);
  if (dirExists) throw new Error(`Directory "${projectName}" already exists.`);

  const packageManager = await select({
    message: "Package manager?",
    options: [
      { value: "npm", label: "npm" },
      { value: "pnpm", label: "pnpm" },
      { value: "yarn", label: "yarn" },
    ],
    initialValue: "npm",
  });

  ensureNotCancelled(packageManager);

  const pmAvailable = await ensurePackageManagerAvailable(
    packageManager as ProjectAnswers["packageManager"],
    process.cwd(),
  );
  if (!pmAvailable)
    throw new Error(
      `El gestor de paquetes "${packageManager}" no está instalado o no está en el PATH. Instálalo o elige otro.`,
    );

  const features = await multiselect({
    message: "What optional features would you like to add?",
    options: OPTIONAL_FEATURES.map((f) => ({ value: f.id, label: f.label })),
    required: false,
  });

  ensureNotCancelled(features);

  outro("Generating your project...");

  return {
    projectName,
    targetDir,
    packageManager: packageManager as ProjectAnswers["packageManager"],
    features: features as string[],
  };
};

/** Si el valor es una cancelación de clack, sale del proceso con gracia. */
function ensureNotCancelled<T>(value: T | symbol): asserts value is T {
  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }
}
