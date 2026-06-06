import { join } from "node:path";
import type { Feature } from "../../interfaces/feature.js";
import type { ScaffoldContext } from "../../interfaces/scaff-context.js";
import { configurePrismaConfig } from "./ast/prisma-config.ats.js";
import { configureSchemaPrisma } from "./ast/schema-prisma.ats.js";
import { configureTsConfigBuild } from "./ast/ts-config-build.ats.js";
import { modifyNestModule } from "../../utils/ast/modify-nest-module.js";
import { addToEnvSchema } from "../../utils/ast/add-to-env-schema.js";

export const prismaFeature: Feature = {
  id: "prisma",
  label: "Prisma ORM",
  templateDir: "prisma",
  dependencies: [
    { name: "@prisma/client" },
    { name: "@prisma/adapter-pg" },
    { name: "pg" },
    { name: "dotenv" },
    { name: "prisma", dev: true },
    { name: "@types/pg", dev: true },
  ],
  commandsBeforeInstall: [
    {
      file: "npx",
      args: [
        "--yes",
        "prisma",
        "init",
        "--datasource-provider",
        "postgresql",
        "--output",
        "../src/prisma/generated",
      ],
    },
  ],
  scripts: {
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev && pnpm prisma:generate",
    "prisma:migrate:dev-c": "prisma migrate dev --create-only",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:migrate:resolve:applied": "prisma migrate resolve --applied",
    "prisma:migrate:resolve:rollback": "prisma migrate resolve --rolled-back",
    "prisma:migrate:reset": "prisma migrate reset && pnpm prisma:generate",
    "prisma:diff": "ts-node ./src/scripts/prisma-diff.script.ts",
    "prisma:push": "prisma db push",
    "prisma:pull": "prisma db pull",
    "prisma:pull-p": "prisma db pull --print",
    "prisma:validate": "prisma validate",
    "prisma:status": "prisma migrate status",
    "prisma:studio": "prisma studio",
    "prisma:format": "prisma format",
  },
  tsconfigPaths: {
    "@prisma-orm/*": ["./src/prisma/generated/*"],
    "@prisma-orm/service": ["./src/prisma/prisma.service"],
    "@prisma-orm/module": ["./src/prisma/prisma.module"],
    // @prisma-orm/client
  },
  envs: [
    {
      key: "DB_HOST",
      example: "localhost",
      schema: `z.hostname()`,
    },
    {
      key: "DB_PORT",
      example: "5432",
      schema: `z
      .string()
      .transform(Number)
      .pipe(z.number().int().positive().min(1).max(65535))`,
    },
    {
      key: "DB_USER",
      example: "my-user",
      schema: `z.string().min(1)`,
    },
    {
      key: "DB_PASSWORD",
      example: "password",
      schema: `z.string().min(1)`,
    },
    {
      key: "DB_NAME",
      example: "test",
      schema: `z.string().min(1)`,
    },
    {
      key: "DB_SCHEMA",
      example: "public",
      schema: `z.string().min(1)`,
    },
  ],

  async apply({ project, targetDir }: ScaffoldContext): Promise<void> {
    addToEnvSchema(
      project,
      join(targetDir, "src", "config", "envs", "env.schema.ts"),
      "envSchema",
      this.envs!,
    );
    configurePrismaConfig(project, join(targetDir, "prisma.config.ts"));
    configureSchemaPrisma(join(targetDir, "prisma", "schema.prisma"));
    await configureTsConfigBuild(join(targetDir, "tsconfig.build.json"));
    modifyNestModule(
      project,
      join(targetDir, "src", "core", "filters", "filters.module.ts"),
      {
        providers: [
          {
            kind: "useClass",
            provide: "APP_FILTER",
            className: "PrismaExceptionFilter",
            importPath: "@core/filters",
            provideImport: {
              name: "APP_FILTER",
              moduleSpecifier: "@nestjs/core",
            },
          },
        ],
      },
    );
    modifyNestModule(project, join(targetDir, "src", "app.module.ts"), {
      imports: [
        {
          name: "PrismaModule",
          moduleSpecifier: "@prisma-orm/module",
        },
      ],
    });
  },
};
