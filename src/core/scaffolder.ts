import { BASE_FEATURES, OPTIONAL_FEATURES } from '../features/index.js';
import { mergeScripts } from '../utils/pkg-json.js';
import { logger } from '../utils/logger.js';
import type { ScaffoldContext } from '../interfaces/scaff-context.js';
import { Project, QuoteKind } from 'ts-morph';
import { copyDir } from '../utils/copy-dir.js';
import { baseTemplateDir, featureTemplateDir } from '../utils/paths.js';
import { collectRecords } from '../utils/collect-records.js';
import { mergeTsconfigPaths } from '../utils/ts-config.js';
import { generateBarrels } from '../utils/generate-barrels.js';
import { join } from 'node:path';
import { collectItemsGrouped } from '../utils/collect-items-grouped.js';
import { mergeEnvs } from '../utils/env.js';
import type { DependencySpec } from '../interfaces/dependency-spec.js';
import type { ProjectAnswers } from '../interfaces/project-answers.js';
import { runCommand } from '../utils/exec/run-command.js';
import { runNestNew } from '../utils/exec/run-nest-new.js';
import { runInstallDependencies } from '../utils/exec/run-install-dependencies.js';
import { runGitInit } from '../utils/exec/run-git-init.js';
import { resolveCommand } from '../utils/exec/resolve-command.js';
import { runFormat } from '../utils/exec/run-format.js';
import { rollback } from '../utils/rollback.js';

export const scaffold = async (answers: ProjectAnswers): Promise<void> => {
  const {
    features: featuresSelectedIds,
    targetDir,
    projectName,
    packageManager,
  } = answers;
  try {
    await runNestNew(answers);

    await copyDir(baseTemplateDir(), targetDir);

    const featuresSelected = OPTIONAL_FEATURES.filter((f) =>
      featuresSelectedIds.includes(f.id),
    );

    const allFeatures = [...BASE_FEATURES, ...featuresSelected];

    for (const { setupCommands } of allFeatures)
      for (const cmd of setupCommands ?? []) {
        const { file, args } = resolveCommand(cmd, packageManager);
        await runCommand(file, args, { cwd: targetDir });
      }

    for (const { templateDir } of allFeatures)
      if (templateDir)
        await copyDir(featureTemplateDir(templateDir), targetDir);

    const collectedDeps: DependencySpec[] = allFeatures.flatMap(
      ({ dependencies }) => dependencies ?? [],
    );

    const collectedScripts = collectRecords(
      allFeatures,
      (f) => f.scripts,
      'script',
    );

    const collectedTsconfigPaths = collectRecords(
      allFeatures,
      (f) => f.tsconfigPaths,
      'path alias',
    );

    const collectedEnvs = collectItemsGrouped(
      allFeatures,
      (f) => f.envs,
      (e) => e.key,
      'variable de entorno',
    );

    await mergeScripts(targetDir, collectedScripts);
    await mergeTsconfigPaths(targetDir, collectedTsconfigPaths);
    await mergeEnvs(targetDir, collectedEnvs);

    const project = new Project({
      tsConfigFilePath: join(targetDir, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
      manipulationSettings: {
        quoteKind: QuoteKind.Single,
      },
    });

    for (const feature of allFeatures)
      await feature.apply?.({
        targetDir,
        answers,
        project,
      } as ScaffoldContext);
    await project.save();

    await generateBarrels(join(targetDir, 'src'));

    // for (const { commandsBeforeInstall } of allFeatures)
    //   for (const cmd of commandsBeforeInstall ?? []) {
    //     const { file, args } = resolveCommand(cmd, packageManager);
    //     await runCommand(file, args, { cwd: targetDir });
    //   }

    await runInstallDependencies(answers, collectedDeps);

    await runFormat(targetDir, project, packageManager);

    for (const { commandsAfterInstall } of allFeatures)
      for (const cmd of commandsAfterInstall ?? []) {
        const { file, args } = resolveCommand(cmd, packageManager);
        await runCommand(file, args, { cwd: targetDir });
      }

    await runGitInit(targetDir);

    logger.success(`Proyecto "${projectName}" creado.`);
  } catch (error: unknown) {
    await rollback(targetDir);
    throw error;
  }
};
