import type { Project } from "ts-morph";
import type { ProjectAnswers } from "./project-answers.js";

/** Contexto que el scaffolder pasa a cada feature al aplicarla. */
export interface ScaffoldContext {
  /** Ruta absoluta del proyecto que se está generando. */
  targetDir: string;
  /** Respuestas del usuario, por si una feature necesita decidir algo. */
  answers: ProjectAnswers;
  /** Proyecto ts-morph ya cargado, compartido entre features. */
  project: Project;
}
