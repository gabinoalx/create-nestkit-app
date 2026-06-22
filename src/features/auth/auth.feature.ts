import { join } from 'node:path';
import type { Feature } from '../../interfaces/feature.js';
import type { ScaffoldContext } from '../../interfaces/scaff-context.js';
import { modifyNestModule } from '../../utils/ast/modify-nest-module.js';
import { addToEnvSchema } from '../../utils/ast/add-to-env-schema.js';

export const authFeature: Feature = {
  id: 'auth',
  label: 'Autenticación (JWT + Passport)',
  templateDir: 'auth',
  dependencies: [
    { name: '@nestjs/jwt' },
    { name: '@nestjs/passport' },
    { name: 'passport' },
    { name: 'passport-jwt' },
    { name: 'passport-local' },
    { name: 'bcrypt' },
    { name: 'ms' },
    { name: '@types/bcrypt', dev: true },
    { name: '@types/ms', dev: true },
    { name: '@types/passport-jwt', dev: true },
    { name: '@types/passport-local', dev: true },
  ],
  envs: [
    {
      key: 'JWT_ACCESS_TOKEN_SECRET',
      example: 'your_token',
      schema: `z.string().min(1)`,
    },
    {
      key: 'JWT_ACCESS_TOKEN_EXPIRY_TIME',
      example: '15m',
      schema: `z.templateLiteral([
      z.number().int().positive(),
      z.enum(['s', 'm', 'h', 'd']),])`,
    },
    {
      key: 'JWT_REFRESH_TOKEN_SECRET',
      example: 'your_token',
      schema: ` z.string().min(1)`,
    },
    {
      key: 'JWT_REFRESH_TOKEN_EXPIRY_TIME',
      example: '7d',
      schema: `z.templateLiteral([
      z.number().int().positive(),
      z.enum(['s', 'm', 'h', 'd']),
      ])`,
    },
  ],

  apply({ project, targetDir }: ScaffoldContext): void {
    addToEnvSchema(
      project,
      join(targetDir, 'src', 'config', 'envs', 'env.schema.ts'),
      'envSchema',
      this.envs!,
    );
    modifyNestModule(project, join(targetDir, 'src', 'app.module.ts'), {
      imports: [
        {
          name: 'AuthModule',
          moduleSpecifier: '@modules/auth/auth.module',
        },
        {
          name: 'UsersModule',
          moduleSpecifier: '@modules/users/users.module',
        },
      ],
      providers: [
        {
          kind: 'useClass',
          provide: 'APP_GUARD',
          className: 'JwtAuthGuard',
          importPath: '@core/guards',
          provideImport: {
            name: 'APP_GUARD',
            moduleSpecifier: '@nestjs/core',
          },
          position: 'start',
        },
      ],
    });
  },
};
