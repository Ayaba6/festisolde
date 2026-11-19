import { describe, it, expect } from 'vitest';
import { FESTIVAL, festivalPhase, countdown, totalPlaces, standWhatsappUrl } from '../festival';

describe('festival', () => {
  it('compte 50 places au total', () => {
    expect(totalPlaces()).toBe(50);
  });

  it('donne la bonne phase autour des dates', () => {
    expect(festivalPhase(new Date('2026-12-17T23:59:00Z'))).toBe('avant');
    expect(festivalPhase(new Date('2026-12-18T00:00:00Z'))).toBe('pendant');
    expect(festivalPhase(new Date('2026-12-27T23:59:00Z'))).toBe('pendant');
    expect(festivalPhase(new Date('2026-12-28T00:00:00Z'))).toBe('apres');
  });

  it('calcule le compte à rebours', () => {
    expect(countdown(new Date('2026-12-16T21:30:00Z'))).toEqual({ days: 1, hours: 2, minutes: 30 });
    expect(countdown(new Date('2026-12-18T08:00:00Z'))).toBeNull();
  });

  it('prépare un message WhatsApp pour réserver un stand', () => {
    const url = standWhatsappUrl();
    expect(url.startsWith(`https://wa.me/${FESTIVAL.whatsapp}?text=`)).toBe(true);
    expect(decodeURIComponent(url)).toContain('réserver un stand');
  });
});
