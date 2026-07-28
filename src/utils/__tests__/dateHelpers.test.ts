import { describe, it, expect } from 'vitest';
import { formatTime, formatEventDateRange } from '../dateHelpers';

// ── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('heure ronde -> "20h"', () => {
    expect(formatTime(new Date(2025, 0, 6, 20, 0))).toBe('20h');
  });

  it('heure avec minutes -> "20h30"', () => {
    expect(formatTime(new Date(2025, 0, 6, 20, 30))).toBe('20h30');
  });

  it('minutes < 10 padded -> "9h05"', () => {
    expect(formatTime(new Date(2025, 0, 6, 9, 5))).toBe('9h05');
  });

  it('minuit -> "0h"', () => {
    expect(formatTime(new Date(2025, 0, 6, 0, 0))).toBe('0h');
  });
});

// ── formatEventDateRange ─────────────────────────────────────────────────────

// Dates locales sans ambiguïté de fuseau horaire
const ALLDAY = '2025-01-06T00:00:00'; // lundi 6 janvier 2025 — minuit local (all-day)
const TIMED = '2025-01-06T20:00:00'; // 20h
const TIMED_END = '2025-01-06T22:00:00'; // 22h
const ALLDAY_END = '2025-01-08T00:00:00'; // mercredi 8 janvier — minuit local

describe('formatEventDateRange', () => {
  it("date seule sans fin ni heure -> pas de '.' ni de '->'", () => {
    const result = formatEventDateRange(ALLDAY);
    expect(result).not.toContain('·');
    expect(result).not.toContain('→');
    expect(result).toContain('2025');
  });

  it("date avec heure de debut sans fin -> inclut l'heure", () => {
    const result = formatEventDateRange(TIMED);
    expect(result).toMatch(/20/);
    expect(result).not.toContain('·');
  });

  it('meme jour avec creneau horaire -> contient le separateur et les deux heures', () => {
    const result = formatEventDateRange(TIMED, TIMED_END);
    expect(result).toContain('·'); // ·
    expect(result).toContain('20h');
    expect(result).toContain('22h');
  });

  it("meme jour avec seulement heure de debut -> 'a partir de'", () => {
    const result = formatEventDateRange(TIMED, ALLDAY);
    expect(result).toContain('à partir de'); // à partir de
    expect(result).toContain('20h');
  });

  it('meme jour sans heure (tout-jour) -> pas de separateur', () => {
    const result = formatEventDateRange(ALLDAY, ALLDAY);
    expect(result).not.toContain('·');
    expect(result).not.toContain('→');
  });

  it('multi-jours -> contient la fleche de plage', () => {
    const result = formatEventDateRange(ALLDAY, ALLDAY_END);
    expect(result).toContain('→'); // →
    expect(result).not.toContain('·');
  });
});
