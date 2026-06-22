import { dirname, relative, sep } from 'node:path';

export const relativeImportFilePath = (
  fromFile: string,
  toFile: string,
): string => {
  if (!fromFile || !toFile)
    throw new Error(
      `relativeImportPath: paths cannot be empty. Got fromFile="${fromFile}", toFile="${toFile}"`,
    );

  let rel = relative(dirname(fromFile), toFile);
  rel = rel.split(sep).join('/');
  rel = rel.replace(/\.d\.ts$/, '').replace(/\.tsx?$/, '');
  if (!rel.startsWith('.')) rel = `./${rel}`;

  return rel;
};
