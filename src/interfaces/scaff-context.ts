import type { Project } from 'ts-morph';
import type { ProjectAnswers } from './project-answers.js';

export interface ScaffoldContext {
  targetDir: string;
  answers: ProjectAnswers;
  project: Project;
}
