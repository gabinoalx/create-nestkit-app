import fs from 'fs-extra';

export const readJson = async (
  jsonPath: string,
): Promise<Record<string, any>> => {
  let raw: string;
  try {
    raw = await fs.readFile(jsonPath, 'utf8');
  } catch (cause) {
    throw new Error(`No se encontró JSON en ${jsonPath}`, { cause });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    throw new Error(`${jsonPath} no es JSON válido`, {
      cause,
    });
  }

  if (!(typeof parsed === 'object' && parsed !== null))
    throw new Error(`El JSON en ${jsonPath} no tiene la forma esperada`);

  return parsed as Record<string, any>;
};

export const writeJson = async (
  jsonPath: string,
  json: Record<string, any>,
): Promise<void> => {
  const jsonStringified = JSON.stringify(json, null, 2);
  await fs.outputFile(jsonPath, `${jsonStringified}\n`, 'utf8');
};
