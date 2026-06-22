export interface ProjectAnswers {
  projectName: string;
  targetDir: string;
  packageManager: 'npm' | 'pnpm' | 'yarn';
  features: string[];
}
