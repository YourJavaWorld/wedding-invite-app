export type RSVPStatus = "pending" | "confirmed" | "declined";

export type GuestResponse = {
  id: string;
  name: string;
  email: string;
  status: RSVPStatus;
  guests: number;
  note: string;
  createdAt: string;
};

export const eventInfo = {
  coupleNames: "Andreea & Răzvan",
  date: "2026-06-05T17:30:00",
  venue: "Castelul de la Munte",
  venueAddress: "Strada Florilor 24, Brașov",
  dressCode: "Elegant",
  countDownTitle: "Numărătoarea inversă",
};

export const initialGuests: GuestResponse[] = [
  {
    id: "g1",
    name: "Maria Popescu",
    email: "maria@example.com",
    status: "confirmed",
    guests: 2,
    note: "Ne bucurăm enorm!",
    createdAt: "2025-10-06T12:00:00.000Z",
  },
  {
    id: "g2",
    name: "Alex Ionescu",
    email: "alex@example.com",
    status: "declined",
    guests: 1,
    note: "Ne pare rău, dar nu putem ajunge.",
    createdAt: "2025-10-07T10:30:00.000Z",
  },
  {
    id: "g3",
    name: "Elena & Andrei",
    email: "elena.andrei@example.com",
    status: "pending",
    guests: 2,
    note: "Încă nu știm dacă putem veni.",
    createdAt: "2025-10-08T08:15:00.000Z",
  },
];

export const adminCredentials = {
  email: "admin@wedding.com",
  password: "admin123",
};

export const storageKey = "wedding-rsvp-responses-v1";
