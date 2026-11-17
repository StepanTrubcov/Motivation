import { NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/telegramAuth.mjs';
import { prisma } from '@/lib/prisma/prismaPostgresClient';

export async function proxy(request) {
  try {
    const denial = await authorizeApiRequest(request, prisma);
    if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status });
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: 'Сервис временно недоступен. Попробуйте ещё раз.' }, { status: 503 });
  }
}
export const config = { matcher: '/api/:path*' };
