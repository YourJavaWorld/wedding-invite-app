import { NextResponse } from 'next/server';
import { readGuests, upsertGuest, type RSVPStatus } from '@/lib/server-store';

export async function GET() {
  const guests = await readGuests();
  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const status = (body.status === 'declined' || body.status === 'pending' ? body.status : 'confirmed') as RSVPStatus;
    const guestsCount = Math.max(1, Number(body.guests) || 1);
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const updated = await upsertGuest({
      name,
      email,
      status,
      guests: guestsCount,
      note,
    });

    const savedResponse = updated.find((guest) => guest.email === email && guest.name.toLowerCase() === name.toLowerCase()) ?? updated[0];

    return NextResponse.json({ success: true, guest: savedResponse }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error.' },
      { status: 500 },
    );
  }
}
