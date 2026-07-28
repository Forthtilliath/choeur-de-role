export type CodeError =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'DB_ERROR'
  | 'INVALID_ROLE'
  | 'INVALID_DATA'
  | 'API_ERROR';

export class AppError extends Error {
  code: CodeError;
  message: string;

  constructor(code: CodeError, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.message = message;
  }
}
