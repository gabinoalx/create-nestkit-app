import { log } from "@clack/prompts";

/**
 * Capa de salida de la CLI. Envuelve @clack/prompts para que el progreso del
 * scaffolder combine visualmente con los prompts interactivos. Centralizar la
 * salida aquí permite cambiar la librería subyacente sin tocar el resto del
 * código: el scaffolder solo conoce logger.step/success/warn/error.
 */
export const logger = {
  /** Un paso del proceso en marcha (ej. "Creando proyecto base..."). */
  step(message: string): void {
    log.step(message);
  },

  /** Operación completada con éxito. */
  success(message: string): void {
    log.success(message);
  },

  /** Aviso no fatal (ej. una feature desconocida que se ignora). */
  warn(message: string): void {
    log.warn(message);
  },

  /** Error que conviene mostrar al usuario antes de abortar. */
  error(message: string): void {
    log.error(message);
  },

  /** Información neutra. */
  info(message: string): void {
    log.info(message);
  },
};
