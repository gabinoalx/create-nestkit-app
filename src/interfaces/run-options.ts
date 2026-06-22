export interface RunOptions {
  cwd: string;
  timeout?: number;
  env?: Record<string, string>;
  silent?: boolean;
  interactive?: boolean;
}
