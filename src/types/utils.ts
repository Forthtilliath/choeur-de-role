// export type Result<T> = { data: T | null; error: string | null };
type AppError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'DB_ERROR'; message: string }
  | { code: 'INVALID_ROLE'; message: string }
  | { code: 'INVALID_DATA'; message: string };

export type Result<T> = Promise<{ data: T; error: null } | { data: null; error: AppError }>;

export type Merge<T> = { [K in keyof T]: T[K] };
