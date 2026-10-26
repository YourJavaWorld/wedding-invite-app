import { promises as fs } from 'fs';
import path from 'path';
import { supabase } from './supabase';

export type RSVPStatus = 'pending' | 'confirmed' | 'declined';

export type GuestResponse = {
  id: string;
  name: string;
  email: string;
  status: RSVPStatus;
  guests: number;
  childrenCount: number;
  vegetarianMeals: number;
  allergies: string;
  stayOption: 'none' | 'accommodation' | 'transport';
  transportDeparture: string;
  note: string;
  createdAt: string;
};

export const defaultGuests: GuestResponse[] = [
  {
    id: 'guest-demo-1',
    name: 'Maria Popescu',
    email: 'maria@example.com',
    status: 'confirmed',
    guests: 2,
    childrenCount: 0,
    vegetarianMeals: 0,
    allergies: '',
    stayOption: 'none',
    transportDeparture: '',
    note: 'Ne bucurăm mult! ✨',
    createdAt: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 'guest-demo-2',
    name: 'Alex Ionescu',
    email: 'alex@example.com',
    status: 'declined',
    guests: 1,
    childrenCount: 0,
    vegetarianMeals: 0,
    allergies: '',
    stayOption: 'none',
    transportDeparture: '',
    note: 'Nu putem participa, dar vă urăm multă fericire.',
    createdAt: '2026-10-06T10:30:00.000Z',
  },
];

const dataFilePath = path.join(process.cwd(), '.data', 'guests.json');

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify(defaultGuests, null, 2), 'utf8');
  }
}

function mapRowToGuest(row: Record<string, unknown>): GuestResponse {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    name: String(row.name ?? ''),
    email: String(row.email ?? '').toLowerCase(),
    status: String(row.status ?? 'pending') as RSVPStatus,
    guests: Number(row.guests ?? 1),
    childrenCount: Number(row.children_count ?? 0),
    vegetarianMeals: Number(row.vegetarian_meals ?? 0),
    allergies: String(row.allergies ?? ''),
    stayOption: String(row.stay_option ?? 'none') as GuestResponse['stayOption'],
    transportDeparture: String(row.transport_departure ?? ''),
    note: String(row.note ?? ''),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function readGuests(): Promise<GuestResponse[]> {
  if (supabase) {
    const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!Array.isArray(data)) throw new Error('Supabase returned an invalid guest list.');
    return data.map((row) => mapRowToGuest(row));
  }

  await ensureDataFile();

  try {
    const raw = await fs.readFile(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw) as GuestResponse[];
    return Array.isArray(parsed)
      ? parsed.map((guest) => ({
          ...guest,
          email: guest.email ?? '',
          childrenCount: guest.childrenCount ?? 0,
          vegetarianMeals: guest.vegetarianMeals ?? 0,
          allergies: guest.allergies ?? '',
          stayOption: guest.stayOption ?? 'none',
          transportDeparture: guest.transportDeparture ?? '',
        }))
      : defaultGuests;
  } catch {
    return defaultGuests;
  }
}

export async function writeGuests(guests: GuestResponse[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(guests, null, 2), 'utf8');
}

export async function upsertGuest(
  input: Omit<GuestResponse, 'id' | 'createdAt' | 'email'> & { email?: string | null; id?: string },
): Promise<GuestResponse> {
  if (supabase) {
    const normalizedName = input.name.trim();
    const normalizedEmail = input.email?.trim().toLowerCase() || null;
    const nextGuest = {
      name: normalizedName,
      email: normalizedEmail,
      status: input.status,
      guests: Math.max(1, Number(input.guests) || 1),
      children_count: input.childrenCount,
      vegetarian_meals: input.vegetarianMeals,
      allergies: input.allergies.trim(),
      stay_option: input.stayOption,
      transport_departure: input.transportDeparture || null,
      note: input.note?.trim() ?? '',
    };

    let existing: { id: string } | undefined;
    if (normalizedEmail) {
      const { data: existingRows, error } = await supabase.from('guests').select('*').eq('email', normalizedEmail);
      if (error) throw new Error(error.message);
      existing = existingRows?.find((row) => String(row.name).toLowerCase() === normalizedName.toLowerCase());
    }

    let savedRow: Record<string, unknown> | null;
    if (existing) {
      const { data, error } = await supabase
        .from('guests')
        .update(nextGuest)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      savedRow = data;
    } else {
      const { data, error } = await supabase
        .from('guests')
        .insert({ ...nextGuest, id: input.id ?? crypto.randomUUID() })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      savedRow = data;
    }

    if (!savedRow) throw new Error('Supabase did not return the saved guest response.');
    return mapRowToGuest(savedRow);
  }

  const guests = await readGuests();
  const normalizedName = input.name.trim();
  const normalizedEmail = input.email?.trim().toLowerCase() ?? '';

  const existingIndex = guests.findIndex(
    (guest) => Boolean(normalizedEmail) && guest.name.trim().toLowerCase() === normalizedName.toLowerCase() && guest.email.trim().toLowerCase() === normalizedEmail,
  );

  const nextGuest: GuestResponse = {
    id: input.id ?? crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    status: input.status,
    guests: Math.max(1, Number(input.guests) || 1),
    childrenCount: input.childrenCount,
    vegetarianMeals: input.vegetarianMeals,
    allergies: input.allergies.trim(),
    stayOption: input.stayOption,
    transportDeparture: input.transportDeparture,
    note: input.note?.trim() ?? '',
    createdAt: new Date().toISOString(),
  };

  const updated = [...guests];

  if (existingIndex >= 0) {
    updated[existingIndex] = nextGuest;
  } else {
    updated.unshift(nextGuest);
  }

  await writeGuests(updated);
  return nextGuest;
}

export function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  return password?.trim() ? password : undefined;
}
