import { ExecaError } from "execa";
import { scaffold } from "./core/scaffolder.js";
import { collectAnswers } from "./prompts/index.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  const answers = await collectAnswers();
  await scaffold(answers);
}

main().catch(async (error: unknown) => {
  if (error instanceof ExecaError || error instanceof Error) {
    logger.error(error.message);
    console.error(error);
  } else logger.error("An unexpected error occurred.");
  process.exit(1);
});
