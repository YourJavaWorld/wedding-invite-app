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
  const openedDoors = useRef(new Set<'left' | 'right'>());
  const [timeLeft, setTimeLeft] = useState(() => formatCountdown(0));
  const [form, setForm] = useState<{
    name: string;
    status: RSVPStatus;
    guests: number;
    childrenCount: number;
    vegetarianMeals: number;
    allergies: string;
    stayOption: 'none' | 'accommodation' | 'transport';
    transportDeparture: string;
    note: string;
  }>({
    name: '',
    status: 'confirmed',
    guests: 2,
    childrenCount: 0,
    vegetarianMeals: 0,
    allergies: '',
    stayOption: 'none',
    transportDeparture: '',
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
    if (!canScroll) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [canScroll]);

  useEffect(() => {
    if (!canScroll) return;

    const sections = document.querySelectorAll<HTMLElement>('.invite-page .invite-reveal');
    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
    setCanScroll(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    openingTimeout.current = window.setTimeout(() => {
      setHasEntered(true);
      openingTimeout.current = null;
    }, reducedMotion ? 700 : 4250);
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
      setCanScroll(true);
      setHasEntered(true);
    }
  };

  return (
    <div className="invite-experience invite-background min-h-screen px-2 py-6 text-[#35281f] sm:px-4 sm:py-16">
      <div aria-hidden="true" className="ambient-petals">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>

      <main
        aria-hidden={!canScroll}
        inert={!canScroll}
        className={`invite-page relative z-10 mx-auto max-w-4xl ${isOpening ? 'is-opening' : ''} ${hasEntered ? 'is-scrollable is-visible' : ''}`}
      >
        <article className="invitation-paper mx-auto max-w-4xl">
          <section className="invite-hero relative flex flex-col items-center justify-center px-5 text-center">
            <p className="invite-hero-eyebrow">Invitație de nuntă</p>
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

          <div className="invite-details mx-auto">
            <section id="poveste" className="invite-section invite-family invite-reveal scroll-mt-8">
              {inviteeName && <p className="invite-greeting invite-family-greeting">Dragă {inviteeName},</p>}
              <p className="invite-copy family-intro">
                Cu binecuvântarea părinților noștri
              </p>
              <div className="family-names">
                <p>Elena și Cristian Savin</p>
                <span aria-hidden="true">&amp;</span>
                <p>Gabriela și Viorel Bălău</p>
              </div>
              <svg aria-hidden="true" className="family-ornament" viewBox="0 0 180 36" fill="none">
                <path d="M90 18H28m124 0H90M90 18c-9-12-19-12-27-8 5 8 14 10 27 8Zm0 0c9-12 19-12 27-8-5 8-14 10-27 8Zm0 0c-9 12-19 12-27 8 5-8 14-10 27-8Zm0 0c9 12 19 12 27 8-5-8-14-10-27-8Z" />
                <circle cx="90" cy="18" r="3" />
              </svg>
              <p className="invite-copy godparents-intro">
                Și alături de nașii noștri
              </p>
              <p className="godparents-names">Georgiana și Mihai Donose</p>
              <p className="family-closing">
                Vă invităm cu drag să ne fiți alături, să ne bucurăm împreună de această zi specială și să sărbătorim începutul drumului nostru în doi.
              </p>
            </section>

            <section className="invite-section invite-events" aria-label="Momentele nunții">
              <div className="event-timeline">
                <section className="timeline-event church-event invite-reveal" aria-label="Cununia religioasă">
                  <svg aria-hidden="true" className="event-illustration church-illustration" viewBox="0 0 96 80" fill="none">
                    <path pathLength="1" d="M14 68h68M20 68V37l28-19 28 19v31M34 68V45h28v23M44 68V52h8v16M48 10v13m-6-7h12M26 40h44M12 68h72" />
                    <path pathLength="1" d="M17 37 48 16l31 21M36 45v8m24-8v8" />
                  </svg>
                  <div className="event-highlight">
                    <span className="event-highlight-note">Cununia religioasă</span>
                    <span className="timeline-time">{eventInfo.ceremony.time}</span>
                  </div>
                  <h2 className="timeline-label">Un legământ binecuvântat</h2>
                  <h3 className="timeline-venue">{eventInfo.ceremony.venue}</h3>
                  <p className="timeline-address">{eventInfo.ceremony.address}</p>
                  <p className="event-poetry">
                    În liniștea Bisericii Icoanei, ne vom uni destinele și vom primi binecuvântarea pentru drumul pe care îl începem împreună.
                  </p>
                  <a href={eventInfo.ceremony.mapUrl} target="_blank" rel="noreferrer" className="invite-map-link">Deschide harta</a>
                </section>

                <section className="timeline-event reception-event invite-reveal" aria-label="Petrecerea">
                  <svg aria-hidden="true" className="event-illustration reception-illustration" viewBox="0 0 96 80" fill="none">
                    <path pathLength="1" d="m30 19 6 25a10 10 0 0 0 20 0l6-25H30Zm16 35v15m-12 0h24M62 29h14l-4 17a8 8 0 0 1-16 1M65 55v14m-9 0h18M17 18l2 5m-8 8 5 2m46-18 2-5m9 10 5-2" />
                    <path pathLength="1" d="M39 32h14m12 4h9" />
                  </svg>
                  <div className="event-highlight">
                    <span className="event-highlight-note">Petrecerea</span>
                    <span className="timeline-time">{eventInfo.reception.time}</span>
                  </div>
                  <h2 className="timeline-label">O seară de sărbătoare</h2>
                  <h3 className="timeline-venue">{eventInfo.reception.venue}</h3>
                  <p className="timeline-address">{eventInfo.reception.address}</p>
                  <p className="reception-story">
                    În urmă cu patru ani, chiar aici, la Jubile Concept, a început povestea noastră. În ziua nunții, ne întoarcem cu inimile pline de recunoștință, ca să sărbătorim iubirea și să scriem împreună o amintire nouă.
                  </p>
                  <a href={eventInfo.reception.mapUrl} target="_blank" rel="noreferrer" className="invite-map-link">Deschide harta</a>
                </section>
              </div>
            </section>

            <section className="invite-countdown invite-section invite-reveal" aria-label="Numărătoarea inversă">
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
              <p className="invitation-script countdown-welcome">Vă așteptăm cu drag!</p>
            </section>
          </div>
        </article>

        <section
          id="rsvp"
          className="rsvp-section invite-reveal mx-auto scroll-mt-8 px-6 text-center"
        >
          <div className="mb-8 text-center">
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.35em] text-[#604329]">RSVP</p>
            <h2 className="mt-3 font-serif text-3xl text-[#392b22] sm:text-4xl">
              Ne-ar bucura să ne confirmați prezența
            </h2>
            <p className="mt-3 text-sm text-[#493a2d]">
              Până la {eventInfo.rsvpDeadline}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#392b22]">
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
              <label className="block text-sm font-medium text-[#392b22]">
                Vei participa?
                <select
                  value={form.status}
                  onChange={(e) => setForm((current) => ({
                    ...current,
                    status: e.target.value as RSVPStatus,
                    ...(e.target.value === 'declined'
                      ? { childrenCount: 0, vegetarianMeals: 0, allergies: '', stayOption: 'none' as const, transportDeparture: '' }
                      : {}),
                  }))}
                  className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                >
                  <option value="confirmed">Da, vin</option>
                  <option value="declined">Nu, nu pot</option>
                </select>
              </label>
            </div>

            {form.status === 'confirmed' && (
              <>
                <label className="block text-sm font-medium text-[#392b22]">
                  Număr persoane
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.guests}
                    onChange={(e) => {
                      const guests = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                      setForm((current) => ({
                        ...current,
                        guests,
                        childrenCount: Math.min(current.childrenCount, guests),
                        vegetarianMeals: Math.min(current.vegetarianMeals, guests),
                      }));
                    }}
                    className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#392b22]">
                    Număr copii
                    <select
                      value={form.childrenCount}
                      onChange={(e) => setForm((current) => ({ ...current, childrenCount: Number(e.target.value) }))}
                      className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                    >
                      {Array.from({ length: form.guests + 1 }, (_, count) => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-[#392b22]">
                    Număr meniuri vegetariene
                    <select
                      value={form.vegetarianMeals}
                      onChange={(e) => setForm((current) => ({ ...current, vegetarianMeals: Number(e.target.value) }))}
                      className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                    >
                      {Array.from({ length: form.guests + 1 }, (_, count) => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-[#392b22]">
                  Alergii sau intoleranțe alimentare
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={(e) => setForm((current) => ({ ...current, allergies: e.target.value }))}
                    className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                  />
                </label>

                <fieldset className="rsvp-options">
                  <legend className="text-sm font-medium text-[#f3ead8]">Ai nevoie de...?</legend>
                  <div className="rsvp-choice-grid">
                    {[
                      { value: 'transport', label: 'Transport' },
                      { value: 'accommodation', label: 'Cazare' },
                      { value: 'none', label: 'Niciuna' },
                    ].map((option) => (
                      <label key={option.value} className="rsvp-choice">
                        <input
                          type="radio"
                          name="stayOption"
                          value={option.value}
                          checked={form.stayOption === option.value}
                          onChange={() => setForm((current) => ({
                            ...current,
                            stayOption: option.value as typeof current.stayOption,
                            transportDeparture: '',
                          }))}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {form.stayOption === 'transport' && (
                  <label className="block text-sm font-medium text-[#392b22]">
                    Localitatea de plecare
                    <select
                      required
                      value={form.transportDeparture}
                      onChange={(e) => setForm((current) => ({ ...current, transportDeparture: e.target.value }))}
                      className="mt-2 w-full rounded-sm border border-[#cbd0d7] bg-white px-4 py-3 text-[#26354a] outline-none transition focus:border-[#52637c] focus:ring-2 focus:ring-[#52637c]/15"
                    >
                      <option value="">Alege localitatea</option>
                      <option value="Casimcea">Casimcea</option>
                      <option value="Piatra Neamț">Piatra Neamț</option>
                    </select>
                  </label>
                )}
              </>
            )}

            <label className="block text-sm font-medium text-[#392b22]">
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

        <section className="invite-closing invite-reveal text-center" aria-label="Încheierea invitației">
            <svg aria-hidden="true" className="closing-ornament" viewBox="0 0 180 80" fill="none">
              <path d="M90 68C76 45 55 19 21 18c12 4 19 13 22 25C27 33 15 31 5 36c30 2 53 15 70 35m15-3c14-23 35-49 69-50-12 4-19 13-22 25 16-10 28-12 38-7-30 2-53 15-70 35" />
              <path d="M90 9c-9 11-9 22 0 32 9-10 9-21 0-32Z" />
            </svg>
            <p className="invite-closing-note">Cu drag, vă așteptăm</p>
            <p className="invite-closing-names invitation-script">{eventInfo.coupleNames}</p>
            <p className="invite-closing-date">{eventInfo.dateLabel}</p>
            <span aria-hidden="true" className="invite-closing-heart">♥</span>
        </section>
      </main>

      <section
        aria-hidden={canScroll}
        className={`glass-door-intro ${isOpening ? 'is-opening' : ''} ${hasEntered ? 'is-scroll-unlocked is-dismissed' : ''}`}
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
