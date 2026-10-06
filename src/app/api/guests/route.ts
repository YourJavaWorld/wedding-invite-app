import { NextResponse } from 'next/server';
import { readGuests } from '@/lib/server-store';

export async function GET() {
  const guests = await readGuests();
  return NextResponse.json(guests);
}
