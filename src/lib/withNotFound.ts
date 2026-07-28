import { notFound } from 'next/navigation';
import { AppError } from './appError';

export async function withNotFound<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError && e.code === 'NOT_FOUND') notFound();
    throw e;
  }
}
