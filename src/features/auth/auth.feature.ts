import type { Feature } from "../../interfaces/feature.js";
import type { ScaffoldContext } from "../../interfaces/scaff-context.js";

export const authFeature: Feature = {
  id: "auth",
  label: "Autenticación (JWT + Passport)",
  templateDir: "auth",
  dependencies: [],
  async apply(ctx: ScaffoldContext): Promise<void> {},
};
