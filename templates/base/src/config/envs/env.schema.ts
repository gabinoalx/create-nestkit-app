import z from "zod";

export const envSchema = z.object({});

export type EnvConfig = z.infer<typeof envSchema>;
