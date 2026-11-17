import { NextResponse } from 'next/server';
export async function PUT() {
  return NextResponse.json({ error: 'Use atomic completion or lifecycle operation' }, { status: 409 });
}
