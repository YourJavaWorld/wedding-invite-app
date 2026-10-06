'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

function FlowerIllustration({ className, variant }: { className: string; variant: 'upper' | 'lower' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 400 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {variant === 'upper' ? (
          <>
            <path d="M207 169c20 104 66 274 112 519" />
            <path d="M230 275c-46-37-94-52-151-43 48 15 82 38 118 77" />
            <path d="M257 385c37-49 80-74 137-82-42 26-72 57-98 106" />
            <path d="M274 485c-41-35-75-47-121-42 43 16 73 39 103 78" />
            <path d="M301 578c33-41 67-63 116-72-37 23-63 52-86 93" />
            <path d="M199 170c-34-6-77-13-97-38-14-18-8-37 11-40 25-4 61 34 86 78Z" />
            <path d="M199 168c-23-35-43-72-30-96 9-17 27-19 40-4 17 20 7 63-10 100Z" />
            <path d="M204 168c1-39 8-79 35-93 18-9 34 3 32 22-3 26-37 54-67 71Z" />
            <path d="M205 171c28-28 63-54 91-45 19 6 23 24 9 37-20 20-64 19-100 8Z" />
            <path d="M199 171c-17-6-34-15-50-18-15-3-31 5-43-2-11-7-12-22-3-29 7-6 16-5 24 0-12-12-18-26-13-37 5-12 19-16 30-7 4-15 19-22 31-14 9-14 28-16 38-5 12-11 29-6 33 10 16-7 32 4 29 20 17 0 27 14 20 28 15 8 15 25 2 33 4 15-8 27-23 25-10 11-26 10-39 1-12 7-24 5-36-5Z" />
            <path d="M114 102c25 16 48 38 69 65m-3-91c9 26 13 54 19 83m69-63c-18 24-39 43-65 59m83-21c-25 8-51 10-78 8" />
            <path d="M126 134c19 11 40 22 67 31m-34-75c11 22 21 46 34 75m73-53c-16 21-39 39-73 53m84-34c-24 9-51 13-84 34" />
            <path d="M127 243c30 4 59 15 87 36m-87-36c17 19 31 39 44 62" />
            <path d="M359 308c-28 19-53 45-74 76m74-76c-17 26-30 51-40 82" />
            <path d="M153 443c29 4 56 17 80 37m-80-37c17 19 32 40 45 63" />
            <path d="M394 405c-28 22-51 49-70 81m70-81c-15 26-26 53-34 83" />
            <path d="M205 179c-13 15-22 31-27 51m36-48c-2 22 0 41 5 59" />
          </>
        ) : (
          <>
            <path d="M210 389c-11 98-17 192-18 311" />
            <path d="M203 490c-58-28-98-28-146-5 47-1 84 13 124 46" />
            <path d="M199 555c-40 44-75 63-131 67 40-23 68-51 92-96" />
            <path d="M193 628c-30 26-52 47-76 73m91-70c21 22 39 42 58 67" />
            <path d="M207 389c-30-10-65-23-78-48-9-17-1-31 15-30 23 1 47 38 63 78Z" />
            <path d="M208 388c-21-26-39-57-29-79 8-17 24-18 35-3 14 20 8 52-6 82Z" />
            <path d="M212 388c-2-32 2-64 23-78 15-10 29 0 28 17-1 22-26 46-51 61Z" />
            <path d="M214 390c22-24 50-45 73-39 17 5 20 20 8 32-17 16-51 17-81 7Z" />
            <path d="M207 389c-14-5-23-13-32-23-8-9-21-9-28-19-7-9-3-21 7-24-8-10-7-22 2-28 9-5 18-1 24 7 0-14 8-24 20-24 10 0 16 7 18 17 7-12 19-16 29-11 9 5 11 15 8 25 12-6 24-3 29 7 5 9 1 18-7 25 14 2 22 12 19 23-3 10-14 14-25 12-4 13-16 19-28 14-9 11-22 11-32 3-10 8-22 7-32-4Z" />
            <path d="M159 326c18 14 35 33 49 56m-24-66c12 18 20 42 25 68m54-81c-10 25-27 49-51 74m92-44c-22 18-49 32-86 45" />
            <path d="M158 363c16 10 32 18 50 27m-10-66c5 21 9 43 13 66m67-48c-16 18-38 34-67 48m77-30c-20 9-44 20-77 30" />
            <path d="M203 486c-14-16-27-28-44-39m44 39c8-22 20-40 36-56m-36 56c-25-12-50-19-78-20m78 20c23-16 47-27 74-33" />
            <path d="M57 485c34 7 63 19 91 40m-91-40c19 16 35 34 50 56" />
            <path d="M68 590c33-12 61-29 86-54m-86 54c24-14 47-25 73-31" />
            <path d="M194 532c22 42 47 84 72 127" />
            <path d="M263 596c22-8 39 2 40 20 1 17-12 43-31 62-12-22-20-51-16-68 1-6 3-11 7-14Z" />
            <path d="M272 601c-4 23-4 48 0 72m-14-55 25-9m-27 22 25-9m-22 23 20-8" />
          </>
        )}
      </g>
    </svg>
  );
}

export function WeddingInvite() {
  const [isOpening, setIsOpening] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const openingTimeout = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(() => formatCountdown(0));
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
    const updateCountdown = () => {
      setTimeLeft(formatCountdown(targetDate - Date.now()));
    };
    const timeout = setTimeout(updateCountdown, 0);
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      if (openingTimeout.current !== null) {
        window.clearTimeout(openingTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (!hasEntered) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [hasEntered]);

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

  const openInvitation = () => {
    if (isOpening) return;

    setIsOpening(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 5100;
    openingTimeout.current = window.setTimeout(() => setHasEntered(true), delay);
  };

  return (
    <div className="invite-experience invite-background min-h-screen px-2 py-6 text-[#35465f] sm:px-4 sm:py-16">
      <div aria-hidden="true" className="ambient-petals">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>

      <main
        aria-hidden={!hasEntered}
        inert={!hasEntered}
        className={`invite-page relative z-10 mx-auto max-w-4xl ${isOpening ? 'is-opening' : ''} ${hasEntered ? 'is-visible' : ''}`}
      >
        <article className="invitation-paper relative mx-auto max-w-3xl overflow-hidden px-4 py-10 shadow-[0_18px_70px_rgba(52,68,91,0.12)] sm:px-12 sm:py-16 md:px-16">
          <div aria-hidden="true" className="invitation-frame" />
          <FlowerIllustration variant="upper" className="invitation-flower invitation-flower-top" />
          <FlowerIllustration variant="lower" className="invitation-flower invitation-flower-bottom" />

          <div className="invitation-content relative z-10 mx-auto max-w-2xl text-center">
            <h1 className="invitation-script couple-title mt-10 leading-tight text-[#30435f] sm:mt-16">
              {eventInfo.coupleNames}
            </h1>

            <p className="mt-5 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[#586981] sm:mt-7 sm:text-xs sm:tracking-[0.35em]">
              Cu binecuvântarea părinților
            </p>

            <div className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-2 text-[0.58rem] uppercase leading-relaxed tracking-[0.09em] text-[#5c6b80] sm:mt-5 sm:gap-3 sm:text-xs sm:tracking-[0.22em]">
              <p>Elena și Cristian Savin</p>
              <p>Gabriela și Viorel Bălău</p>
            </div>

            <div className="mx-auto mt-8 max-w-xl text-[0.62rem] uppercase leading-[1.8] tracking-[0.11em] text-[#586981] sm:mt-12 sm:text-xs sm:tracking-[0.2em]">
              <p>Vă invităm să ne fiți alături de noi și de nașii noștri</p>
              <p className="mt-1 font-medium">Georgiana și Mihai Donose</p>
            </div>

            <p className="mt-9 text-[0.58rem] font-semibold uppercase leading-relaxed tracking-[0.12em] text-[#52637c] sm:mt-16 sm:text-sm sm:tracking-[0.28em]">
              La celebrarea căsătoriei noastre în data de
            </p>
            <p className="invitation-script wedding-date mt-2 text-[#26354a] sm:mt-3">
              {eventInfo.dateLabel}
            </p>

            <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-2 sm:mt-9 sm:gap-6">
              <section aria-label="Ceremonia religioasă" className="px-0.5 sm:px-2">
                <div className="event-icon mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#748198]/50 sm:mb-3 sm:h-12 sm:w-12">
                  <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-6 w-6 sm:h-7 sm:w-7">
                    <path d="M4 27h24M7 27V15l9-7 9 7v12M13 27v-8h6v8M16 3v6m-3-3h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 17h1m10 0h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-serif text-base leading-tight tracking-wide text-[#394b65] sm:text-xl">Cununia religioasă</h2>
                <p className="mt-1 text-xs sm:text-sm">{eventInfo.ceremony.venue}</p>
                <p className="mt-1 text-xs sm:text-sm">ora {eventInfo.ceremony.time}</p>
                <p className="mt-1 text-xs leading-relaxed sm:text-sm">{eventInfo.ceremony.address}</p>
                <a
                  href={eventInfo.ceremony.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[0.58rem] uppercase tracking-[0.12em] underline decoration-[#8a96a7]/60 underline-offset-4 transition hover:text-[#172942] sm:mt-3 sm:text-xs sm:tracking-[0.18em]"
                >
                  Vezi pe hartă
                </a>
              </section>

              <section aria-label="Petrecerea" className="px-0.5 sm:px-2">
                <div className="event-icon mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#748198]/50 sm:mb-3 sm:h-12 sm:w-12">
                  <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-6 w-6 sm:h-7 sm:w-7">
                    <path d="M5 14h22l-2 13H7L5 14Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M4 14c0-2 2-3 4-2 1-3 4-3 5-1 2-3 5-3 6 0 2-2 5-1 5 1 2-1 4 0 4 2M16 11V5m-3 4 3 2 3-2M12 19h8m-4-4v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="font-serif text-base leading-tight tracking-wide text-[#394b65] sm:text-xl">Petrecerea</h2>
                <p className="mt-1 text-xs sm:text-sm">{eventInfo.reception.venue}</p>
                <p className="mt-1 text-xs sm:text-sm">ora {eventInfo.reception.time}</p>
                <p className="mt-1 text-xs leading-relaxed sm:text-sm">{eventInfo.reception.address}</p>
                <a
                  href={eventInfo.reception.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[0.58rem] uppercase tracking-[0.12em] underline decoration-[#8a96a7]/60 underline-offset-4 transition hover:text-[#172942] sm:mt-3 sm:text-xs sm:tracking-[0.18em]"
                >
                  Vezi pe hartă
                </a>
              </section>
            </div>

            <p className="invitation-script invitation-signature mt-12 text-[#30435f] sm:mt-14">
              Vă așteptăm cu drag!
            </p>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed tracking-wide text-[#37465a] sm:text-base">
              Vă rugăm să confirmați prezența până la data de
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[0.14em] text-[#37465a]">
              {eventInfo.rsvpDeadline}
            </p>
            <a
              href="#rsvp"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#52637c] px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#35465f] transition hover:bg-[#35465f] hover:text-[#fffdf9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35465f]"
            >
              Confirmă prezența
            </a>
          </div>
        </article>

        <section
          aria-label="Numărătoarea inversă"
          className="mx-auto mt-10 max-w-3xl border-y border-[#52637c]/20 py-6 text-center"
        >
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[#586981]">
            Până la ziua cea mare
          </p>
          <div className="mx-auto mt-4 grid max-w-xl grid-cols-4 gap-2 sm:gap-5">
            {countdownItems.map((item) => (
              <div key={item.label}>
                <div className="font-serif text-3xl tabular-nums text-[#30435f] sm:text-4xl">
                  {item.value}
                </div>
                <div className="mt-1 text-[0.55rem] uppercase tracking-[0.18em] text-[#69778b] sm:text-[0.65rem] sm:tracking-[0.25em]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="rsvp"
          className="mx-auto mt-10 max-w-2xl scroll-mt-8 rounded-sm border border-[#52637c]/20 bg-[#fffdf9]/80 p-6 shadow-[0_12px_40px_rgba(52,68,91,0.07)] sm:p-10"
        >
          <div className="mb-8 text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[#68788e]">RSVP</p>
            <h2 className="mt-3 font-serif text-3xl text-[#30435f] sm:text-4xl">
              Vă rugăm să confirmați
            </h2>
            <p className="mt-3 text-sm text-[#687384]">
              Până la {eventInfo.rsvpDeadline}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#394b65]">
                Numele tău
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                  placeholder="Numele complet"
                />
              </label>

              <label className="block text-sm font-medium text-[#394b65]">
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                  placeholder="email@example.com"
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#394b65]">
                Vei participa?
                <select
                  value={form.status}
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as RSVPStatus }))}
                  className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                >
                  <option value="confirmed">Da, vin</option>
                  <option value="declined">Nu, nu pot</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#394b65]">
                Număr persoane
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.guests}
                  onChange={(e) => setForm((current) => ({ ...current, guests: Number(e.target.value) || 1 }))}
                  className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-[#394b65]">
              Mesaj pentru noi
              <textarea
                value={form.note}
                onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                placeholder="Scrie-ne un mesaj..."
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-sm bg-[#35465f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#26354a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35465f]"
            >
              Trimite răspunsul
            </button>

            {submitted ? (
              <p role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Răspunsul tău a fost salvat cu succes. Îți mulțumim!
              </p>
            ) : null}
          </form>
        </section>

        <footer className="py-8 text-center">
          <a
            href="/admin"
            className="text-xs uppercase tracking-[0.2em] text-[#758094] underline decoration-[#758094]/40 underline-offset-4 hover:text-[#35465f]"
          >
            Administrare
          </a>
        </footer>
      </main>

      <section
        aria-hidden={hasEntered}
        className={`envelope-intro ${isOpening ? 'is-opening' : ''} ${hasEntered ? 'is-dismissed' : ''}`}
        aria-label="Deschide invitația de nuntă"
        inert={hasEntered}
      >
        <div className="envelope-welcome">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#65738a]">
            O invitație specială
          </p>
        </div>

        <div className={`envelope-scene ${isOpening ? 'is-opening' : ''}`}>
          <div className="envelope-body">
            <div className="envelope-flap" />
            <svg aria-hidden="true" className="envelope-folds" viewBox="0 0 520 320" preserveAspectRatio="none">
              <path className="envelope-side-fold envelope-side-fold-left" d="M0 0 260 138 0 320Z" />
              <path className="envelope-side-fold envelope-side-fold-right" d="M520 0 260 138 520 320Z" />
              <path className="envelope-bottom-fold" d="M0 320 260 138 520 320Z" />
              <path className="envelope-fold-seam" d="M0 320 260 138 520 320" />
            </svg>
            <div className="wax-seal-wrap">
              <button
                type="button"
                className="wax-seal"
                onClick={openInvitation}
                disabled={isOpening}
                aria-label="Deschide invitația apăsând sigiliul M și M"
              >
                <span aria-hidden="true">M&amp;M</span>
              </button>
            </div>
          </div>
        </div>

        <p className="envelope-hint text-[0.65rem] uppercase tracking-[0.23em] text-[#65738a]">
          {isOpening ? 'Cu drag, pentru voi' : 'Apăsați sigiliul pentru a deschide'}
        </p>
      </section>
    </div>
  );
}
