export type ErrorResponse<T = Record<string, unknown>> = T & {
  timestamp: string;
  path: string;
};
