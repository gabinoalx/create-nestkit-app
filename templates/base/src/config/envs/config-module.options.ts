import { ConfigModuleOptions } from '@nestjs/config';
import { envSchema } from '.';
import z from 'zod';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  expandVariables: true,
  validate: (config: Record<string, unknown>) => {
    const { success, error, data } = envSchema.safeParse(config);
    if (!success) throw new Error(z.prettifyError(error));
    return data;
  },
};
