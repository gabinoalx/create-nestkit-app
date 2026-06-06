/** Respuestas que el usuario dio en los prompts. */
export interface ProjectAnswers {
  projectName: string;
  targetDir: string;
  packageManager: "npm" | "pnpm" | "yarn";
  features: string[];
}
