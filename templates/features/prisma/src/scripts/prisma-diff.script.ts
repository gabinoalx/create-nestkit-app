import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

try {
  const prismaMigrationPath = 'prisma/migrations';
  const prismaSchemaPath = 'prisma/schema.prisma';

  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const name = process.argv[2] || 'sync';
  const migrationDir = `${prismaMigrationPath}/${timestamp}_${name}`;
  const fullPathMigrationDir = resolve(migrationDir);

  mkdirSync(fullPathMigrationDir, { recursive: true });

  // from (de) to(a) --> de schema a DB, que SQL falta para que este como la DB
  const sql = execSync(
    `pnpx prisma migrate diff --from-schema=${resolve(prismaSchemaPath)} --to-config-datasource --script`,
    { encoding: 'utf8' },
  ).trim();

  if (!sql || sql.includes('-- This is an empty migration.')) {
    console.log(
      '-- No se detecto descincronización entre schema y la base de datos',
    );
    require('node:fs').rmSync(fullPathMigrationDir, {
      recursive: true,
      force: true,
    });
    process.exit(0);
  }

  writeFileSync(`${fullPathMigrationDir}/migration.sql`, sql, 'utf8');
  console.log(`-- Migración creada exitosamente : ${migrationDir}\n`);
  console.log(sql + '\n');
} catch (err) {
  console.error(`\n -- Error al generar migración:`);
  console.error(`   ${err['message']}\n`);
  process.exit(1);
}
