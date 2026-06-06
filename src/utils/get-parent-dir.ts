import path from "node:path";
//todo: probar la validacion con test junto con validateProjectName
export const getParentDir = (fullPath: string): string =>
  path.dirname(path.normalize(fullPath));
