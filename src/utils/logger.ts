import { log } from '@clack/prompts';

export const logger = {
  step(message: string): void {
    log.step(message);
  },

  success(message: string): void {
    log.success(message);
  },

  warn(message: string): void {
    log.warn(message);
  },

  error(message: string): void {
    log.error(message);
  },

  info(message: string): void {
    log.info(message);
  },
};
