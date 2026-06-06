import fs from "fs-extra";
import path from "node:path";
const EXCLUDED = ["node_modules", ".git", "dist"];

export const copyDir = async (src: string, dest: string): Promise<void> => {
  const exists = await fs.pathExists(src);
  if (!exists) throw new Error(`Source directory not found: ${src}`);
  await fs.copy(src, dest, {
    overwrite: true,
    filter: (srcPath: string) => {
      const relativePath = path.relative(src, srcPath);
      if (!relativePath) return true;
      return !EXCLUDED.some((excluded) =>
        relativePath.split(path.sep).includes(excluded),
      );
    },
  });
};
