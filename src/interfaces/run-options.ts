export interface RunOptions {
  cwd: string;
  timeout?: number; // ms, default 3 minutos
  env?: Record<string, string>;
  silent?: boolean; // suprimir output del terminal
  interactive?: boolean; //
}
