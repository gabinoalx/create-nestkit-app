import type { execa } from "execa";

export type RunResult = Awaited<ReturnType<typeof execa>>;
