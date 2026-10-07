'use client';

import { useEffect, useMemo, useState } from 'react';

type RSVPStatus = 'pending' | 'confirmed' | 'declined';

type GuestResponse = {
  id: string;
  name: string;
  email: string;
  status: RSVPStatus;
  guests: number;
  note: string;
  createdAt: string;
};

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [guests, setGuests] = useState<GuestResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteName, setInviteName] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLinkMessage, setInviteLinkMessage] = useState('');

  const loadGuests = async () => {
    const response = await fetch('/api/guests');
    if (!response.ok) return;
    const data = (await response.json()) as GuestResponse[];
    setGuests(data);
  };

  const checkSession = async () => {
    const response = await fetch('/api/admin/session');
    if (!response.ok) {
      setLoading(false);
      return;
    }

    const data = (await response.json()) as { authenticated: boolean };
    setIsAuthenticated(data.authenticated);
    setLoading(false);
  };

  useEffect(() => {
    checkSession();
    loadGuests();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadGuests();
    }
  }, [isAuthenticated]);

  const filteredGuests = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return guests;

    return guests.filter((guest) => `${guest.name} ${guest.email}`.toLowerCase().includes(value));
  }, [guests, search]);

  const stats = useMemo(() => {
    const confirmed = guests.filter((guest) => guest.status === 'confirmed').length;
    const declined = guests.filter((guest) => guest.status === 'declined').length;
    const pending = guests.filter((guest) => guest.status === 'pending').length;
    const totalGuests = guests.reduce((sum, guest) => sum + guest.guests, 0);

    return { confirmed, declined, pending, totalGuests };
  }, [guests]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      window.alert('Parolă invalidă.');
      return;
    }

    setIsAuthenticated(true);
    setPassword('');
    await loadGuests();
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setPassword('');
  };

  const generateInviteLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = inviteName.trim();
    if (!name) {
      setInviteLinkMessage('Introdu numele familiei sau al persoanei invitate.');
      setInviteUrl('');
      return;
    }

    const url = new URL('/', window.location.origin);
    url.searchParams.set('nume', name);
    setInviteUrl(url.toString());
    setInviteLinkMessage('Linkul personalizat a fost generat.');
  };

  const copyInviteLink = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteLinkMessage('Linkul a fost copiat.');
    } catch {
      setInviteLinkMessage('Nu am putut copia automat linkul. Selectează-l și copiază-l manual.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fffaf4,_#f5efe8_55%,_#eaded5)] px-4">
        <div className="text-sm uppercase tracking-[0.3em] text-stone-500">Se încarcă...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fffaf4,_#f5efe8_55%,_#eaded5)] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-[0_30px_80px_rgba(120,86,65,0.12)] backdrop-blur-sm">
          <p className="text-center text-xs uppercase tracking-[0.4em] text-rose-500">Admin</p>
          <h1 className="mt-6 text-center font-serif text-4xl text-stone-800">Login</h1>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <label className="block text-sm text-stone-700">
              Parolă administrator
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-rose-300"
                placeholder="Introdu parola"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-stone-800 px-5 py-3 text-sm uppercase tracking-[0.25em] text-white transition hover:bg-stone-700"
            >
              Intră în dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f4ee] px-4 py-10 text-stone-800">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-rose-500">Admin dashboard</p>
            <h1 className="mt-3 font-serif text-5xl text-stone-800">Lista invitaților</h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-xs uppercase tracking-[0.2em] text-stone-700"
            >
              Delogare
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-xs uppercase tracking-[0.2em] text-stone-700"
            >
              Înapoi la invitație
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Confirmat</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-600">{stats.confirmed}</p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Refuzat</p>
            <p className="mt-4 text-3xl font-semibold text-rose-500">{stats.declined}</p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">În așteptare</p>
            <p className="mt-4 text-3xl font-semibold text-amber-500">{stats.pending}</p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Total persoane</p>
            <p className="mt-4 text-3xl font-semibold text-stone-800">{stats.totalGuests}</p>
          </div>
        </div>

        <section className="mt-8 rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Invitații personalizate</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-800">Generează un link</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Introdu numele familiei sau al persoanei, apoi trimite-i linkul personalizat.
            </p>
          </div>

          <form onSubmit={generateInviteLink} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="invitee-name">Numele invitatului</label>
            <input
              id="invitee-name"
              type="text"
              value={inviteName}
              onChange={(event) => {
                setInviteName(event.target.value);
                setInviteUrl('');
                setInviteLinkMessage('');
              }}
              maxLength={100}
              required
              placeholder="Ex.: Familia Popescu"
              className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-rose-300"
            />
            <button
              type="submit"
              className="rounded-full bg-stone-800 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-stone-700"
            >
              Generează link
            </button>
          </form>

          {inviteUrl && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="generated-invite-link">Link personalizat</label>
              <input
                id="generated-invite-link"
                type="url"
                value={inviteUrl}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
              />
              <button
                type="button"
                onClick={copyInviteLink}
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-xs uppercase tracking-[0.2em] text-stone-700 transition hover:bg-stone-50"
              >
                Copiază linkul
              </button>
            </div>
          )}
          {inviteLinkMessage && (
            <p role="status" className="mt-3 text-sm text-stone-600">{inviteLinkMessage}</p>
          )}
        </section>

        <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Caută după nume sau email"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-rose-300"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-left">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase tracking-[0.25em] text-stone-500">Nume</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-[0.25em] text-stone-500">Email</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-[0.25em] text-stone-500">Persoane</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-[0.25em] text-stone-500">Status</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-[0.25em] text-stone-500">Notă</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-stone-50/70">
                    <td className="px-5 py-4 font-medium text-stone-800">{guest.name}</td>
                    <td className="px-5 py-4 text-stone-600">{guest.email}</td>
                    <td className="px-5 py-4 text-stone-600">{guest.guests}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
                          guest.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : guest.status === 'declined'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-600">{guest.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
