import { produceSchema } from "@mrleebo/prisma-ast";
import { readFileSync, writeFileSync } from "node:fs";

export const configureSchemaPrisma = (filePath: string): void => {
  const file = readFileSync(filePath, "utf-8");
  const output = produceSchema(file, (builder) => {
    builder.generator("client").assignment("moduleFormat", "cjs");
  });
  writeFileSync(filePath, output);
};
