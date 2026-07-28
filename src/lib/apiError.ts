import { NextResponse } from 'next/server';
import { AppError, CodeError } from './appError';

const STATUS_MAP: Record<CodeError, number> = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  INVALID_ROLE: 403,
  INVALID_DATA: 400,
  DB_ERROR: 500,
  API_ERROR: 502,
};

export function toApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: STATUS_MAP[error.code] ?? 500 });
  }
  console.error('[api]', error);
  return NextResponse.json({ error: 'Une erreur inattendue est survenue.' }, { status: 500 });
}
