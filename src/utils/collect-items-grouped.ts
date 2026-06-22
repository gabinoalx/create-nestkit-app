import type { Feature } from '../interfaces/feature.js';

export const collectItemsGrouped = <T>(
  features: readonly Feature[],
  select: (f: Feature) => readonly T[] | undefined,
  getKey: (item: T) => string,
  label: string,
): T[][] => {
  const groups: T[][] = [];
  const origin: Record<string, string> = {};

  for (const feature of features) {
    const items = select(feature);
    if (!items?.length) continue;

    const validItems: T[] = [];
    for (const item of items) {
      const key = getKey(item);
      if (origin[key] !== undefined)
        throw new Error(
          `Colisión de ${label} "${key}": las features "${origin[key]}" y ` +
            `"${feature.id}" lo definen. Renombra uno de los dos.`,
        );
      origin[key] = feature.id;
      validItems.push(item);
    }
    if (validItems.length > 0) groups.push(validItems);
  }

  return groups;
};
