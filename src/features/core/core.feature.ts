import type { Feature } from '../../interfaces/feature.js';
import { configureEnvSchema } from './ast/env-schema.ast.js';
import type { ScaffoldContext } from '../../interfaces/scaff-context.js';
import { join } from 'node:path';
import { addToEnvSchema } from '../../utils/ast/add-to-env-schema.js';

export const coreFeature: Feature = {
  id: 'core',
  label: 'Feature Base',
  dependencies: [
    { name: '@nestjs/config' },
    { name: 'nestjs-cls' },
    { name: 'nestjs-pino' },
    { name: 'pino-http' },
    { name: 'pino-pretty' },
    { name: 'cookie-parser' },
    { name: '@types/cookie-parser', dev: true },
    { name: 'zod' },
    { name: 'nestjs-zod' },
  ],
  tsconfigPaths: {
    '@common/module': ['./src/common/common.module'],
    '@common/decorators': ['./src/common/decorators'],
    '@common/pipe': ['./src/common/pipes'],
    '@common/utils': ['./src/common/utils'],
    '@config/envs': ['./src/config/envs'],
    '@config/logger': ['./src/config/logger'],
    '@core/filters/module': ['./src/core/filters/filters.module'],
    '@core/filters': ['./src/core/filters'],
    '@core/constants': ['./src/core/constants'],
    '@core/guards': ['./src/core/guards'],
    '@core/lifecycle': ['./src/core/lifecycle'],
    '@common/interfaces': ['./src/common/interfaces'],
    '@modules/*': ['./src/modules/*'],
  },
  envs: [
    {
      key: 'NODE_ENV',
      example: 'development',
      schema: `z.enum(["development","production"]).default("development")`,
    },
    {
      key: 'APP_NAME',
      example: 'NestJS',
      schema: `z.string().default("Nest")`,
    },
    {
      key: 'MIN_LOG_LEVEL',
      example: 'DEBUG',
      schema: `z
    .enum(Object.values(LEVELS_LOGGER).map((l) => l.name))
    .default("DEBUG")`,
    },
    {
      key: 'APP_PORT',
      example: '3000',
      schema: `z.string().transform(Number).pipe(z.number().int().positive()).default(3000)`,
    },
  ],
  apply({ project, targetDir }: ScaffoldContext): void {
    configureEnvSchema(
      project,
      join(targetDir, 'src', 'config', 'envs', 'env.schema.ts'),
    );
    addToEnvSchema(
      project,
      join(targetDir, 'src', 'config', 'envs', 'env.schema.ts'),
      'envSchema',
      this.envs!,
    );
  },
};
