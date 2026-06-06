// src/utils/collect.ts
//
// Helpers para combinar contribuciones de varias features detectando colisiones
// de clave entre ellas (una colisión = bug de diseño del dev → error).
//   - collectRecords: para contribuciones que son Record<string, V> (scripts, paths).
//   - collectItems:   para contribuciones que son arrays de objetos (env).

import type { Feature } from "../interfaces/feature.js";

/**
 * Combina listas de items de varias features en un solo array, detectando
 * colisiones de clave entre features. La clave de cada item se obtiene con
 * `getKey`. Hermano de collectRecords para contribuciones que son arrays.
 */
export const collectItems = <T>(
  features: readonly Feature[],
  select: (feature: Feature) => readonly T[] | undefined,
  getKey: (item: T) => string,
  label: string,
): T[] => {
  const result: T[] = [];
  const origin: Record<string, string> = {};

  for (const feature of features) {
    const items = select(feature);
    if (!items) continue;

    for (const item of items) {
      const key = getKey(item);
      if (origin[key] !== undefined) {
        throw new Error(
          `Colisión de ${label} "${key}": las features "${origin[key]}" y ` +
            `"${feature.id}" lo definen. Renombra uno de los dos.`,
        );
      }
      result.push(item);
      origin[key] = feature.id;
    }
  }

  return result;
};
