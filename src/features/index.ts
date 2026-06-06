import type { Feature } from "../interfaces/feature.js";
import { coreFeature } from "./core/core.feature.js";
import { dockerFeature } from "./docker/docker.feature.js";
import { prismaFeature } from "./prisma/prisma.feature.js";

export const BASE_FEATURES: readonly Feature[] = [coreFeature, prismaFeature];

export const OPTIONAL_FEATURES: readonly Feature[] = [dockerFeature];

export const ALL_FEATURES: readonly Feature[] = [
  ...BASE_FEATURES,
  ...OPTIONAL_FEATURES,
];

const featureById = (id: string): Feature | undefined =>
  ALL_FEATURES.find((f) => f.id === id);
