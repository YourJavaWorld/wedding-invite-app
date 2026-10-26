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
    const status = (body.status === 'declined' || body.status === 'pending' ? body.status : 'confirmed') as RSVPStatus;
    const guestsCount = Number(body.guests);
    const childrenCount = Number(body.childrenCount);
    const vegetarianMeals = Number(body.vegetarianMeals);
    const allergies = typeof body.allergies === 'string' ? body.allergies.trim() : '';
    const stayOption = body.stayOption;
    const transportDeparture = typeof body.transportDeparture === 'string' ? body.transportDeparture : '';
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Numele este obligatoriu.' }, { status: 400 });
    }
    if (name.length > 160) {
      return NextResponse.json({ error: 'Numele poate avea cel mult 160 de caractere.' }, { status: 400 });
    }
    if (allergies.length > 500 || note.length > 1000) {
      return NextResponse.json({ error: 'Textul pentru alergii sau mesaj este prea lung.' }, { status: 400 });
    }

    if (
      !Number.isInteger(guestsCount) ||
      guestsCount < 1 ||
      guestsCount > 10 ||
      !Number.isInteger(childrenCount) ||
      childrenCount < 0 ||
      childrenCount > guestsCount ||
      !Number.isInteger(vegetarianMeals) ||
      vegetarianMeals < 0 ||
      vegetarianMeals > guestsCount
    ) {
      return NextResponse.json({ error: 'Verifică numărul de persoane, copii și meniuri vegetariene.' }, { status: 400 });
    }

    if (!['none', 'accommodation', 'transport'].includes(stayOption)) {
      return NextResponse.json({ error: 'Selectează cel mult o opțiune de cazare sau transport.' }, { status: 400 });
    }

    const validDepartures = ['Casimcea', 'Piatra Neamț'];
    if (
      (stayOption === 'transport' && !validDepartures.includes(transportDeparture)) ||
      (stayOption !== 'transport' && transportDeparture)
    ) {
      return NextResponse.json({ error: 'Alege localitatea de plecare pentru transport.' }, { status: 400 });
    }

    const savedResponse = await upsertGuest({
      name,
      email: null,
      status,
      guests: guestsCount,
      childrenCount,
      vegetarianMeals,
      allergies,
      stayOption,
      transportDeparture: stayOption === 'transport' ? transportDeparture : '',
      note,
    });

    return NextResponse.json({ success: true, guest: savedResponse }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error.' },
      { status: 500 },
    );
  }
}
