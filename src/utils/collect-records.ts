import type { Feature } from '../interfaces/feature.js';

export const collectRecords = <V>(
  features: readonly Feature[],
  select: (feature: Feature) => Readonly<Record<string, V>> | undefined,
  label: string,
): Record<string, V> => {
  const result: Record<string, V> = {};
  const origin: Record<string, string> = {};

  for (const feature of features) {
    const record = select(feature);
    if (!record) continue;

    for (const [key, value] of Object.entries(record)) {
      if (result[key] !== undefined)
        throw new Error(
          `Colisión de ${label} "${key}": las features "${origin[key]}" y ` +
            `"${feature.id}" lo definen. Renombra uno de los dos.`,
        );
      result[key] = value;
      origin[key] = feature.id;
    }
  }

  return result;
};
