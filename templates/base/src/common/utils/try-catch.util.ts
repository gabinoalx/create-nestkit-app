type SuccessResult<T> = readonly [T, null];
type ErrorResult<E = Error> = readonly [null, E];
type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

export const tryCatch = async <T, E = Error>(
  promise: Promise<T>,
  errorHandler?: (err: unknown) => E,
): Promise<Result<T, E>> => {
  try {
    const data = await promise;
    return [data, null] as const;
  } catch (err: unknown) {
    const error = errorHandler ? errorHandler(err) : (err as E);
    return [null, error as E] as const;
  }
};
