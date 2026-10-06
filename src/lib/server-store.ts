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
    note: 'Ne bucurăm mult! ✨',
    createdAt: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 'guest-demo-2',
    name: 'Alex Ionescu',
    email: 'alex@example.com',
    status: 'declined',
    guests: 1,
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
    note: String(row.note ?? ''),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function readGuests(): Promise<GuestResponse[]> {
  if (supabase) {
    const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((row) => mapRowToGuest(row));
    }
  }

  await ensureDataFile();

  try {
    const raw = await fs.readFile(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw) as GuestResponse[];
    return Array.isArray(parsed) ? parsed : defaultGuests;
  } catch {
    return defaultGuests;
  }
}

export async function writeGuests(guests: GuestResponse[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(guests, null, 2), 'utf8');
}

export async function upsertGuest(input: Omit<GuestResponse, 'id' | 'createdAt'> & { id?: string }): Promise<GuestResponse[]> {
  if (supabase) {
    const normalizedName = input.name.trim();
    const normalizedEmail = input.email.trim().toLowerCase();
    const nextGuest = {
      name: normalizedName,
      email: normalizedEmail,
      status: input.status,
      guests: Math.max(1, Number(input.guests) || 1),
      note: input.note?.trim() ?? '',
    };

    const { data: existingRows } = await supabase.from('guests').select('*').eq('email', normalizedEmail);
    const existing = existingRows?.find((row) => String(row.name).toLowerCase() === normalizedName.toLowerCase());

    if (existing) {
      const { error } = await supabase.from('guests').update(nextGuest).eq('id', existing.id);
      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from('guests').insert({ ...nextGuest, id: input.id ?? crypto.randomUUID() });
      if (error) {
        throw new Error(error.message);
      }
    }

    return readGuests();
  }

  const guests = await readGuests();
  const normalizedName = input.name.trim();
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingIndex = guests.findIndex(
    (guest) => guest.name.trim().toLowerCase() === normalizedName.toLowerCase() && guest.email.trim().toLowerCase() === normalizedEmail,
  );

  const nextGuest: GuestResponse = {
    id: input.id ?? crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    status: input.status,
    guests: Math.max(1, Number(input.guests) || 1),
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
  return updated;
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}
