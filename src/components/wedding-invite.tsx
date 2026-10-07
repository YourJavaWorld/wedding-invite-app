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

export function WeddingInvite({ inviteeName }: { inviteeName?: string }) {
  const [isOpening, setIsOpening] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const openingTimeout = useRef<number | null>(null);
  const scrollTimeout = useRef<number | null>(null);
  const openedDoors = useRef(new Set<'left' | 'right'>());
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
      if (scrollTimeout.current !== null) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (!canScroll) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [canScroll]);

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

    openedDoors.current.clear();
    setIsOpening(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTimeout.current = window.setTimeout(() => {
      setCanScroll(true);
      scrollTimeout.current = null;
    }, reducedMotion ? 300 : 4200);
    openingTimeout.current = window.setTimeout(() => {
      setCanScroll(true);
      setHasEntered(true);
      openingTimeout.current = null;
    }, reducedMotion ? 600 : 7500);
  };

  const handleDoorTransitionEnd = (
    side: 'left' | 'right',
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.propertyName !== 'transform' || !isOpening || hasEntered) return;

    openedDoors.current.add(side);
    if (openedDoors.current.size === 2) {
      if (openingTimeout.current !== null) {
        window.clearTimeout(openingTimeout.current);
        openingTimeout.current = null;
      }
      if (scrollTimeout.current !== null) {
        window.clearTimeout(scrollTimeout.current);
        scrollTimeout.current = null;
      }
      setCanScroll(true);
      setHasEntered(true);
    }
  };

  return (
    <div className="invite-experience invite-background min-h-screen px-2 py-6 text-[#35465f] sm:px-4 sm:py-16">
      <div aria-hidden="true" className="ambient-petals">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>

      <main
        aria-hidden={!canScroll}
        inert={!canScroll}
        className={`invite-page relative z-10 mx-auto max-w-4xl ${isOpening ? 'is-opening' : ''} ${canScroll ? 'is-scrollable' : ''} ${hasEntered ? 'is-visible' : ''}`}
      >
        <article className="invitation-paper mx-auto max-w-4xl">
          <section className="invite-hero relative flex min-h-[86svh] flex-col items-center justify-center px-5 py-20 text-center sm:min-h-[90svh]">
            <svg aria-hidden="true" className="hero-ornament" viewBox="0 0 180 80" fill="none">
              <path d="M90 68C76 45 55 19 21 18c12 4 19 13 22 25C27 33 15 31 5 36c30 2 53 15 70 35m15-3c14-23 35-49 69-50-12 4-19 13-22 25 16-10 28-12 38-7-30 2-53 15-70 35" />
              <path d="M90 9c-9 11-9 22 0 32 9-10 9-21 0-32Z" />
            </svg>
            <h1 className="invite-hero-names invitation-script">{eventInfo.coupleNames}</h1>
            <p className="invite-hero-date">{eventInfo.dateLabel}</p>
            <span aria-hidden="true" className="invite-hero-divider">
              <span />
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8c-1.1 4.6-5.2 5.1-5.2 9.2A5.2 5.2 0 0 0 12 17.2a5.2 5.2 0 0 0 5.2-5.2c0-4.1-4.1-4.6-5.2-9.2Zm0 17.1c-2.4 0-4.3 1.1-4.3 2.4h8.6c0-1.3-1.9-2.4-4.3-2.4Z" /></svg>
              <span />
            </span>
            <a href="#poveste" className="invite-scroll-cue" aria-label="Derulează pentru detaliile invitației">
              <span />
              <span />
            </a>
          </section>

          <div className="invite-details mx-auto max-w-3xl px-6 pb-12 sm:px-12">
            <section id="poveste" className="invite-section invite-family scroll-mt-8">
              {inviteeName && <p className="invite-greeting invite-family-greeting">Dragă {inviteeName},</p>}
              <p className="invite-copy">Cu binecuvântarea părinților noștri</p>
              <div className="family-names">
                <p>Elena și Cristian Savin</p>
                <span aria-hidden="true">&amp;</span>
                <p>Gabriela și Viorel Bălău</p>
              </div>
              <p className="invite-copy godparents-intro">
                Vă invităm să fiți alături de noi și de nașii noștri
              </p>
              <p className="godparents-names">Georgiana și Mihai Donose</p>
            </section>

            <section className="invite-section invite-events" aria-label="Momentele nunții">
              <div className="event-timeline">
                <span aria-hidden="true" className="timeline-connector timeline-connector-top"><span /></span>

                <section className="timeline-event" aria-label="Cununia religioasă">
                  <p className="invite-eyebrow timeline-event-date">05 iunie 2027</p>
                  <div className="timeline-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64" fill="none">
                      <path d="M8 55h48M12 51h40M16 47V31h32v16M12 31l20-12 20 12" />
                      <path d="M22 26V17l5-4 5 4v5M32 19l11-7 7 5v14M24 47V37a8 8 0 0 1 16 0v10M29 47V37a3 3 0 0 1 6 0v10" />
                      <path d="M32 5v9m-4-5h8M24 30h.1m16 0h.1M46 8v6m-3-3h6M18 34h.1m27-.1h.1" />
                    </svg>
                  </div>
                  <p className="timeline-time">{eventInfo.ceremony.time}</p>
                  <h2 className="timeline-label">Cununia religioasă</h2>
                  <h3 className="timeline-venue">{eventInfo.ceremony.venue}</h3>
                  <p className="timeline-address">{eventInfo.ceremony.address}</p>
                  <a href={eventInfo.ceremony.mapUrl} target="_blank" rel="noreferrer" className="invite-map-link">Deschide harta</a>
                </section>

                <span aria-hidden="true" className="timeline-connector"><span /></span>

                <section className="timeline-event reception-event" aria-label="Petrecerea">
                  <div className="timeline-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64" fill="none">
                      <path d="M10 48c1-3 5-5 10-5h24c5 0 9 2 10 5H10ZM13 52h38M18 55v2m28-2v2" />
                      <path d="M17 40c1-10 7-17 15-17s14 7 15 17H17ZM29 23c0-2 1-4 3-4s3 2 3 4" />
                      <path d="M25 16c0-3 2-5 4-7m6 7c0-3 2-5 4-7M8 23c4 3 4 7 0 10m48-10c-4 3-4 7 0 10" />
                      <path d="M21 40c1-5 3-9 6-12m16 12c-1-5-3-9-6-12" />
                    </svg>
                  </div>
                  <p className="timeline-time">{eventInfo.reception.time}</p>
                  <h2 className="timeline-label">Petrecerea</h2>
                  <h3 className="timeline-venue">{eventInfo.reception.venue}</h3>
                  <p className="timeline-address">{eventInfo.reception.address}</p>
                  <a href={eventInfo.reception.mapUrl} target="_blank" rel="noreferrer" className="invite-map-link">Deschide harta</a>
                  <p className="reception-story">
                    În urmă cu patru ani, la o petrecere chiar aici, drumurile noastre s-au întâlnit pentru prima oară. Jubile Concept a rămas locul în care a început povestea noastră, iar acum ne întoarcem cu emoție și bucurie să sărbătorim iubirea alături de voi.
                  </p>
                </section>
              </div>
            </section>

            <section className="invite-countdown invite-section" aria-label="Numărătoarea inversă">
              <p className="invite-eyebrow">Cu emoție, numărăm clipele</p>
              <h2 className="invite-section-title">Până la ziua noastră cea mare</h2>
              <div className="countdown-grid">
                {countdownItems.map((item) => (
                  <div key={item.label} className="countdown-item">
                    <div className="countdown-value">{item.value}</div>
                    <div className="countdown-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </section>
            <p className="invitation-script countdown-welcome">Vă așteptăm cu drag!</p>
          </div>
        </article>

        <section
          id="rsvp"
          className="rsvp-section mx-auto max-w-3xl scroll-mt-8 px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          <div className="mb-8 text-center">
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.35em] text-[#967c60]">RSVP</p>
            <h2 className="mt-3 font-serif text-3xl text-[#59483b] sm:text-4xl">
              Ne-ar bucura să ne confirmați prezența
            </h2>
            <p className="mt-3 text-sm text-[#776653]">
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
        aria-hidden={canScroll}
        className={`glass-door-intro ${isOpening ? 'is-opening' : ''} ${canScroll ? 'is-scroll-unlocked' : ''} ${hasEntered ? 'is-dismissed' : ''}`}
        aria-label="Deschide ușile pentru a vedea invitația de nuntă"
        inert={canScroll}
      >
        <div className={`glass-door-scene ${isOpening ? 'is-opening' : ''}`}>
          <div aria-hidden="true" className="glass-door-frame">
            <div
              className="glass-door glass-door-left"
              onTransitionEnd={(event) => handleDoorTransitionEnd('left', event)}
            >
              <div className="glass-door-panel">
                <span aria-hidden="true" className="glass-door-seam glass-door-seam-left" />
              </div>
            </div>
            <div
              className="glass-door glass-door-right"
              onTransitionEnd={(event) => handleDoorTransitionEnd('right', event)}
            >
              <div className="glass-door-panel">
                <span aria-hidden="true" className="glass-door-seam glass-door-seam-right" />
              </div>
            </div>
          </div>
          <div className="wax-seal-wrap">
            <button
              type="button"
              className="wax-seal"
              onClick={openInvitation}
              disabled={isOpening}
              aria-label="Deschide ușile apăsând sigiliul M și M"
            >
              <span aria-hidden="true" className="wax-seal-lettering">
                <span className="wax-seal-initial">M</span>
                <span className="wax-seal-ampersand">&amp;</span>
                <span className="wax-seal-initial">M</span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
