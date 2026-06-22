import fs from 'fs-extra';
import { logger } from './logger.js';

export const rollback = async (targetDir: string): Promise<void> => {
  if (!(await fs.pathExists(targetDir))) return;
  logger.warn('Revirtiendo cambios...');
  try {
    await fs.remove(targetDir);
  } catch {
    logger.warn(
      `No se pudo borrar "${targetDir}" automáticamente. Bórralo manualmente.`,
    );
  }
};
