import { readJson, writeJson } from '../../../utils/json.js';

export const configureTsConfigBuild = async (filePath: string) => {
  const json = await readJson(filePath);
  const newJson: Record<string, string | string[]> = {
    ...json,
    exclude: [...json['exclude']!, 'prisma.config.ts'],
  };

  await writeJson(filePath, newJson);
};
