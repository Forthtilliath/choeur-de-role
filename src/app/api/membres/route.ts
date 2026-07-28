import { NextResponse } from 'next/server';
import { getMembersForTrombi } from '@/components/features/trombinoscope/queries';
import { toApiError } from '@/lib/apiError';

export async function GET() {
  try {
    const data = await getMembersForTrombi();
    return NextResponse.json(data);
  } catch (error) {
    return toApiError(error);
  }
}
