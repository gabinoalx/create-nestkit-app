import { join } from "node:path";
import { readJson, writeJson } from "./json.js";

export const mergeTsconfigPaths = async (
  targetDir: string,
  paths: Readonly<Record<string, string[]>>,
): Promise<void> => {
  if (Object.keys(paths).length === 0) return;

  const tsconfigPath = join(targetDir, "tsconfig.json");
  const tsconfig = await readJson(tsconfigPath);

  tsconfig["compilerOptions"] ??= {};
  delete tsconfig["compilerOptions"]["baseUrl"];
  tsconfig["compilerOptions"]["paths"] ??= {};
  const existingPaths = tsconfig["compilerOptions"]["paths"] as Record<
    string,
    string[]
  >;

  for (const [alias, targets] of Object.entries(paths)) {
    if (existingPaths[alias] === undefined) existingPaths[alias] = [...targets];
    else throw new Error(`El path alias "${alias}" ya existe`);
  }

  await writeJson(tsconfigPath, tsconfig);
};
