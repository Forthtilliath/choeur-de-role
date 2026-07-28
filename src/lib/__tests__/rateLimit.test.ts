import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit } from '../rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('autorise le premier appel', () => {
    expect(checkRateLimit('k1', 3, 60_000)).toBe(true);
  });

  it('autorise les appels sous la limite', () => {
    checkRateLimit('k2', 3, 60_000);
    expect(checkRateLimit('k2', 3, 60_000)).toBe(true);
    expect(checkRateLimit('k2', 3, 60_000)).toBe(true);
  });

  it('bloque quand la limite est atteinte', () => {
    checkRateLimit('k3', 2, 60_000);
    checkRateLimit('k3', 2, 60_000);
    expect(checkRateLimit('k3', 2, 60_000)).toBe(false);
  });

  it('ré-autorise après expiration de la fenêtre', () => {
    checkRateLimit('k4', 1, 1_000);
    checkRateLimit('k4', 1, 1_000); // bloqué

    vi.advanceTimersByTime(1_001);

    expect(checkRateLimit('k4', 1, 1_000)).toBe(true);
  });

  it('les clés différentes sont indépendantes', () => {
    checkRateLimit('kA', 1, 60_000);
    checkRateLimit('kA', 1, 60_000); // kA bloquée

    expect(checkRateLimit('kB', 1, 60_000)).toBe(true); // kB indépendante
  });

  it('limite = 1 bloque dès le second appel', () => {
    expect(checkRateLimit('k5', 1, 60_000)).toBe(true);
    expect(checkRateLimit('k5', 1, 60_000)).toBe(false);
  });
});
