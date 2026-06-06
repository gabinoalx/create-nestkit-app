/** Un comando a ejecutar en el proyecto generado, sin shell (file + args). */
export interface CommandSpec {
  file: string; // ej. "npx"
  args: readonly string[]; // ej. ["--yes", "prisma", "init", "--datasource-provider", "postgresql"]
}
