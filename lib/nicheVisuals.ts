import type { Niche, ThemeId } from '@/data/types';
import { themes } from '@/theme/colors';

/** Soft cover gradient pairs per niche (no remote images required). */
export function coverGradient(themeId: ThemeId): [string, string, string] {
  switch (themeId) {
    case 'barber':
      return ['#1C1917', '#44403C', '#B45309'];
    case 'health':
      return ['#0F766E', '#0D9488', '#5EEAD4'];
    case 'beauty':
      return ['#9D174D', '#BE185D', '#F9A8D4'];
    default:
      return ['#0F766E', '#14B8A6', '#99F6E4'];
  }
}

export function nicheMoodLabel(niche: Niche): string {
  switch (niche) {
    case 'barber':
      return 'Estilo & precisión';
    case 'health':
      return 'Cuidado con calma';
    case 'beauty':
      return 'Belleza que inspira';
    default:
      return 'Tu agenda, a tu ritmo';
  }
}

export function themeAccent(themeId: ThemeId): string {
  return themes[themeId].accent;
}

/** Map niche → theme for PoC rubro switches (other → neutral). */
export function themeForNiche(niche: Niche): ThemeId {
  if (niche === 'barber' || niche === 'health' || niche === 'beauty') return niche;
  return 'neutral';
}

/**
 * Map theme → niche when the theme is a rubro accent.
 * `neutral` does not force a niche change (caller keeps current).
 */
export function nicheForTheme(theme: ThemeId): Niche | null {
  if (theme === 'barber' || theme === 'health' || theme === 'beauty') return theme;
  return null;
}

/** Demo chips for Perfil “Probar otro rubro”. */
export const POC_RUBRO_CHIPS: ReadonlyArray<{
  niche: Extract<Niche, 'barber' | 'health' | 'beauty'>;
  label: string;
}> = [
  { niche: 'barber', label: 'Barbería' },
  { niche: 'health', label: 'Salud' },
  { niche: 'beauty', label: 'Belleza' },
];
