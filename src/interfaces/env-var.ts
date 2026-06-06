export interface EnvVar {
  /** Nombre de la variable, ej. "JWT_ACCESS_TOKEN_SECRET". */
  key: string;
  /** Valor de ejemplo para el .env.example. */
  example: string;
  /** Validación zod como código, ej. "z.string().min(1)". Se inserta literal
   *  en el z.object del env.schema.ts. */
  schema: string;
  /** Comentario opcional para el .env.example. */
  comment?: string;
}
