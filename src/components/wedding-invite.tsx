'use client';

import { useEffect, useMemo, useState } from 'react';
import { eventInfo, type RSVPStatus } from '@/lib/wedding-data';

const targetDate = new Date(eventInfo.date).getTime();

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function WeddingInvite() {
  const [mounted, setMounted] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => formatCountdown(targetDate - Date.now()));
  const [form, setForm] = useState<{
    name: string;
    email: string;
    status: RSVPStatus;
    guests: number;
    note: string;
  }>({
    name: '',
    email: '',
    status: 'confirmed',
    guests: 2,
    note: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => setEnvelopeOpen(true), 500);
    const interval = setInterval(() => {
      setTimeLeft(formatCountdown(targetDate - Date.now()));
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const countdownItems = useMemo(
    () => [
      { label: 'Zile', value: timeLeft.days },
      { label: 'Ore', value: timeLeft.hours },
      { label: 'Minute', value: timeLeft.minutes },
      { label: 'Secunde', value: timeLeft.seconds },
    ],
    [timeLeft],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Something went wrong.' }));
        throw new Error(data.error || 'Something went wrong.');
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitted(false);
      window.alert(error instanceof Error ? error.message : 'The RSVP could not be saved.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fffaf4_0%,#f7efe8_38%,#f4e4d7_100%)] px-4 py-8 text-stone-800">
      <div className="mx-auto max-w-5xl">
        <div className="relative mx-auto mt-8 max-w-3xl">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-white/40 blur-3xl" />

          <div className="relative flex min-h-[620px] items-center justify-center">
            <div className={`envelope-shell ${envelopeOpen ? 'open' : ''}`}>
              <div className="envelope-backdrop" />
              <div className="envelope-flap" />
              <div className="envelope-letter">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.45em] text-rose-500">Vă invităm</p>
                  <h1 className="mt-6 font-serif text-5xl tracking-wider text-stone-800 md:text-7xl">
                    {eventInfo.coupleNames}
                  </h1>
                  <div className="mt-6 h-px w-24 bg-rose-300/80 mx-auto" />
                  <p className="mt-6 text-lg uppercase tracking-[0.35em] text-stone-600">
                    05 Iunie 2026
                  </p>
                  <p className="mt-4 text-base uppercase tracking-[0.3em] text-stone-600">
                    Ora 17:30
                  </p>

                  <div className="mt-10 grid gap-3 sm:grid-cols-4">
                    {countdownItems.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-rose-200 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
                        <div className="text-3xl font-semibold text-stone-800">{item.value}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-stone-500">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 rounded-[1.5rem] border border-rose-200 bg-white/70 p-6 shadow-lg">
                    <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Eveniment</p>
                    <p className="mt-4 text-xl font-medium text-stone-700">{eventInfo.venue}</p>
                    <p className="mt-2 text-stone-600">{eventInfo.venueAddress}</p>
                    <p className="mt-4 text-stone-600">Dress code: {eventInfo.dressCode}</p>
                  </div>

                  <div className="mt-10 flex flex-col gap-4 md:flex-row md:justify-center">
                    <a
                      href="#rsvp"
                      className="rounded-full bg-stone-800 px-7 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white transition hover:bg-stone-700"
                    >
                      Confirmă prezența
                    </a>
                    <a
                      href="/admin"
                      className="rounded-full border border-stone-300 bg-white/70 px-7 py-3 text-sm font-medium uppercase tracking-[0.22em] text-stone-700 transition hover:border-stone-400"
                    >
                      Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="rsvp" className="mx-auto mt-14 max-w-2xl rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-[0_30px_80px_rgba(120,86,65,0.10)] backdrop-blur-sm md:p-10">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-rose-500">RSVP</p>
            <h2 className="mt-4 font-serif text-4xl text-stone-800">Te așteptăm alături de noi</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700">
                Numele tău
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none ring-0 transition focus:border-rose-300"
                  placeholder="Numele complet"
                />
              </label>

              <label className="block text-sm font-medium text-stone-700">
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none ring-0 transition focus:border-rose-300"
                  placeholder="email@example.com"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700">
                Vei participa?
                <select
                  value={form.status}
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as RSVPStatus }))}
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-rose-300"
                >
                  <option value="confirmed">Da, vin</option>
                  <option value="declined">Nu, nu pot</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-stone-700">
                Număr persoane
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.guests}
                  onChange={(e) => setForm((current) => ({ ...current, guests: Number(e.target.value) || 1 }))}
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-rose-300"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-stone-700">
              Mesaj pentru noi
              <textarea
                value={form.note}
                onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-rose-300"
                placeholder="Scrie-ne un mesaj..."
              />
            </label>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-rose-200 transition hover:brightness-110"
              >
                Trimite răspunsul
              </button>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Răspunsul tău a fost salvat cu succes. Îți mulțumim! ♥
              </div>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}
