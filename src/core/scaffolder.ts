import { BASE_FEATURES, OPTIONAL_FEATURES } from "../features/index.js";
import { mergeDependencies, mergeScripts } from "../utils/pkg-json.js";
import { logger } from "../utils/logger.js";
import type { ScaffoldContext } from "../interfaces/scaff-context.js";
import { Project } from "ts-morph";
import { copyDir } from "../utils/copy-dir.js";
import { baseTemplateDir, featureTemplateDir } from "../utils/paths.js";
import { collectRecords } from "../utils/collect-records.js";
import { mergeTsconfigPaths } from "../utils/ts-config.js";
import { generateBarrels } from "../utils/generate-barrels.js";
import { join } from "node:path";
import { collectItems } from "../utils/collect-items.js";
import { mergeEnvs } from "../utils/env.js";
import type { DependencySpec } from "../interfaces/dependency-spec.js";
import type { ProjectAnswers } from "../interfaces/project-answers.js";
import { runCommand } from "../utils/exec/run-command.js";
import { runNestNew } from "../utils/exec/run-nest-new.js";
import { runInstall } from "../utils/exec/run-install.js";
import { runGitInit } from "../utils/exec/run-git-init.js";

export const scaffold = async (answers: ProjectAnswers): Promise<void> => {
  const { features: featuresSelectedIds, targetDir, projectName } = answers;
  try {
    await runNestNew(answers);

    await copyDir(baseTemplateDir(), targetDir);

    const featuresSelected = OPTIONAL_FEATURES.filter((f) =>
      featuresSelectedIds.includes(f.id),
    );

    const allFeatures = [...BASE_FEATURES, ...featuresSelected];

    for (const { templateDir } of allFeatures)
      if (templateDir)
        await copyDir(featureTemplateDir(templateDir), targetDir);

    const collectedDeps: DependencySpec[] = allFeatures.flatMap(
      ({ dependencies }) => dependencies ?? [],
    );

    const collectedScripts = collectRecords(
      allFeatures,
      (f) => f.scripts,
      "script",
    );

    const collectedTsconfigPaths = collectRecords(
      allFeatures,
      (f) => f.tsconfigPaths,
      "path alias",
    );

    const collectedEnvs = collectItems(
      allFeatures,
      (f) => f.envs,
      (e) => e.key,
      "variable de entorno",
    );

    await mergeDependencies(targetDir, collectedDeps);
    await mergeScripts(targetDir, collectedScripts);
    await mergeTsconfigPaths(targetDir, collectedTsconfigPaths);
    await mergeEnvs(targetDir, collectedEnvs);

    for (const { commandsBeforeInstall } of allFeatures)
      for (const { file, args } of commandsBeforeInstall ?? [])
        await runCommand(file, args, { cwd: targetDir });

    const project = new Project({
      tsConfigFilePath: join(targetDir, "tsconfig.json"),
    });
    const ctx: ScaffoldContext = {
      targetDir,
      answers,
      project,
    };
    for (const feature of allFeatures) await feature.apply?.(ctx);
    await project.save();

    await generateBarrels(join(targetDir, "src"));
    await runInstall(answers);

    // for (const { commandsAfterInstall } of allFeatures)
    //   for (const { file, args } of commandsAfterInstall ?? [])
    //     await runCommand(file, args, { cwd: targetDir });

    await runGitInit(targetDir);

    logger.success(`Proyecto "${projectName}" creado.`);
  } catch (error: unknown) {
    // await rollback(targetDir);
    throw error;
  }
};
