/**
 * Generic function response type for handling errors as values
 * Either data OR error will be present, never both
 */
export type FnResponse<TData = unknown, TError = Error> =
  | { data: TData; error: null }
  | { data: null; error: TError };
