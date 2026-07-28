import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  // Redirige vers une page client qui gère le fragment
  return NextResponse.redirect(`${origin}/auth/confirm-client`);
}