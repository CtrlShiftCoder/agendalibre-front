import { isEmpresaAdmin } from '@/lib/team';
import {
  colorsForScheme,
  themeForPalette,
  type PaletteId,
  resolveThemeId,
  themes,
  type AppColors,
  type ColorScheme,
  type ThemeTokens,
} from '@/theme/colors';
import { useAppStore } from './useAppStore';

export { resolveThemeId };

/** empresa (admin) → indigo; persona_natural / trabajador / cliente → teal (Soloist). */
export function usePaletteId(): PaletteId {
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  if (profile?.role === 'empresa' && isEmpresaAdmin({ profile, professionals })) {
    return 'indigo';
  }
  return 'teal';
}

export function useThemeTokens(): ThemeTokens {
  const raw = useAppStore((s) => s.profile?.theme);
  const palette = usePaletteId();
  return themeForPalette(themes[resolveThemeId(raw)] ?? themes.neutral, palette);
}

export function resolveColorScheme(profile: {
  colorScheme?: ColorScheme | null;
  darkMode?: boolean | null;
} | null | undefined): ColorScheme {
  if (!profile) return 'light';
  if (profile.colorScheme === 'dark' || profile.colorScheme === 'light') {
    return profile.colorScheme;
  }
  if (profile.darkMode) return 'dark';
  return 'light';
}

/**
 * One source of truth: top-level `appearance` (kept in sync with
 * profile.colorScheme via setAppearance / updateProfile).
 */
export function useColorScheme(): ColorScheme {
  const appearance = useAppStore((s) => s.appearance);
  const profile = useAppStore((s) => s.profile);
  if (appearance === 'dark' || appearance === 'light') return appearance;
  return resolveColorScheme(profile);
}

/** Cream / surface / text tokens for light or soft-dark. */
export function useColors(): AppColors {
  const scheme = useColorScheme();
  const palette = usePaletteId();
  return colorsForScheme(scheme, palette);
}

/** @deprecated alias — prefer useColors() */
export function useBaseColors(): AppColors {
  return useColors();
}

export type AppearanceMode = ColorScheme;
