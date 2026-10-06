import { NextResponse } from 'next/server';
import { readGuests } from '@/lib/server-store';

export async function GET() {
  const guests = await readGuests();

  const confirmed = guests.filter((guest) => guest.status === 'confirmed').length;
  const declined = guests.filter((guest) => guest.status === 'declined').length;
  const pending = guests.filter((guest) => guest.status === 'pending').length;
  const totalGuests = guests.reduce((sum, guest) => sum + guest.guests, 0);

  return NextResponse.json({ confirmed, declined, pending, totalGuests });
}
