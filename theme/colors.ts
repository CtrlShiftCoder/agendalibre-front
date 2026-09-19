/** Flujo layout + Uber-friendly green brand tokens (default look) */
export const flujo = {
  primary: '#059669',
  primaryContainer: '#047857',
  primaryFixed: '#D1FAE5',
  onPrimary: '#FFFFFF',
  surface: '#F7FAF8',
  onSurface: '#141414',
  onSurfaceVariant: '#35453E',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F0FDF4',
  surfaceContainer: '#ECFDF5',
  surfaceContainerHigh: '#D1FAE5',
  secondary: '#2F3D36',
  secondaryContainer: '#E8F5EE',
  tertiary: '#047857',
  tertiaryContainer: '#059669',
  tertiaryFixed: '#ECFDF5',
  outline: '#5F7067',
  /** Links / prices / labels on mint or white (AA small text; CTA fill stays primary) */
  primaryText: '#047857',
  /** Placeholder — AA on white/mint (≥4.5:1 body-size) */
  placeholder: '#55665E',
} as const;

export const baseColors = {
  /** @deprecated alias — use flujo.surface */
  cream: flujo.surface,
  creamDeep: flujo.surfaceContainer,
  white: flujo.surfaceContainerLowest,
  text: flujo.onSurface,
  textMuted: flujo.onSurfaceVariant,
  border: flujo.outline,
  success: flujo.tertiary,
  danger: '#B91C1C',
  primary: flujo.primary,
  primaryText: flujo.primaryText,
  placeholder: flujo.placeholder,
  charcoal: '#141414',
  amber: '#B45309',
  rose: '#BE185D',
  softRose: '#FCE7F3',
  overlay: 'rgba(20, 20, 20, 0.45)',
  /** Flujo surfaces */
  surface: flujo.surface,
  onSurface: flujo.onSurface,
  onSurfaceVariant: flujo.onSurfaceVariant,
  surfaceContainerLowest: flujo.surfaceContainerLowest,
  surfaceContainerLow: flujo.surfaceContainerLow,
  surfaceContainer: flujo.surfaceContainer,
  surfaceContainerHigh: flujo.surfaceContainerHigh,
  primaryContainer: flujo.primaryContainer,
  primaryFixed: flujo.primaryFixed,
  secondary: flujo.secondary,
  secondaryContainer: flujo.secondaryContainer,
  tertiary: flujo.tertiary,
  tertiaryFixed: flujo.tertiaryFixed,
  outline: flujo.outline,
} as const;

export type ThemeId = 'barber' | 'health' | 'beauty' | 'neutral';

const VALID_THEME_IDS: ReadonlySet<string> = new Set([
  'barber',
  'health',
  'beauty',
  'neutral',
]);

/** Coerce any stored/legacy value to a known ThemeId. */
export function resolveThemeId(id: unknown): ThemeId {
  if (typeof id === 'string' && VALID_THEME_IDS.has(id)) {
    return id as ThemeId;
  }
  return 'neutral';
}

export interface ThemeTokens {
  id: ThemeId;
  label: string;
  primary: string;
  primarySoft: string;
  accent: string;
  onPrimary: string;
  tabActive: string;
  /** Soft tint for chips / selected surfaces */
  surfaceTint: string;
  /** Hero / primary button gradient [start, end] */
  gradient: [string, string];
  /** Subtle mint-tinted hero overlay */
  heroGradient: [string, string];
}

/**
 * Niche themes stay in the green family for brand cohesion.
 * Beauty keeps a soft rose accent only; primary buttons/tabs stay green.
 * `neutral` = default Uber-friendly green.
 */
export const themes: Record<ThemeId, ThemeTokens> = {
  neutral: {
    id: 'neutral',
    label: 'Flujo',
    primary: flujo.primary,
    primarySoft: flujo.primaryContainer,
    accent: flujo.primaryContainer,
    onPrimary: '#FFFFFF',
    tabActive: flujo.primary,
    surfaceTint: flujo.primaryFixed,
    gradient: [flujo.primary, flujo.primaryContainer],
    heroGradient: [flujo.primary, flujo.primaryContainer],
  },
  barber: {
    id: 'barber',
    label: 'Barbería',
    primary: flujo.primary,
    primarySoft: flujo.primaryContainer,
    accent: '#B45309',
    onPrimary: '#FFFFFF',
    tabActive: flujo.primary,
    surfaceTint: flujo.primaryFixed,
    gradient: [flujo.primary, '#00A878'],
    heroGradient: ['#141414', '#3D4F46'],
  },
  health: {
    id: 'health',
    label: 'Salud',
    primary: '#059669',
    primarySoft: '#06C167',
    accent: '#047857',
    onPrimary: '#FFFFFF',
    tabActive: '#059669',
    surfaceTint: '#ECFDF5',
    gradient: ['#059669', '#06C167'],
    heroGradient: ['#047857', '#059669'],
  },
  beauty: {
    id: 'beauty',
    label: 'Belleza',
    primary: flujo.primary,
    primarySoft: flujo.primaryContainer,
    accent: '#F472B6',
    onPrimary: '#FFFFFF',
    tabActive: flujo.primary,
    surfaceTint: '#ECFDF5',
    gradient: [flujo.primary, '#00A878'],
    heroGradient: [flujo.primary, '#F472B6'],
  },
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Flujo radii — md 16, cards ~24–32 */
export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  xxl: 32,
  full: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 28,
} as const;

/** Content max-width on wide web (phone-like column) */
export const layout = {
  maxContentWidth: 520,
  narrowBreakpoint: 360,
} as const;

const shadowBase = {
  shadowColor: '#141414',
} as const;

/** Prefer soft shadows (sm) for Flujo cards */
export const shadow = {
  sm: {
    ...shadowBase,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    ...shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  lg: {
    ...shadowBase,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  /** @deprecated use shadow.md — kept for existing call sites */
  card: {
    ...shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  sticky: {
    ...shadowBase,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    shadowColor: flujo.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  /** Selected day chip — soft primary glow rgba(6,193,103,0.35) */
  primaryGlow: {
    shadowColor: 'rgba(6, 193, 103, 1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;


/* ─── Soft dark mode (appearance overlay) ─── */

export type AppearanceMode = 'light' | 'dark';

export const darkBase = {
  cream: '#0F1412',
  creamDeep: '#1A221E',
  white: '#161C19',
  text: '#F3F7F5',
  textMuted: '#C5D0CA',
  border: '#8A9B92',
  success: '#34D399',
  danger: '#F87171',
  primary: '#059669',
  primaryText: '#6EE7B7',
  placeholder: '#AEBBB4',
  charcoal: '#F3F7F5',
  amber: '#FBBF24',
  rose: '#F9A8D4',
  softRose: '#3B1F2B',
  overlay: 'rgba(0, 0, 0, 0.55)',
  surface: '#0F1412',
  onSurface: '#F3F7F5',
  onSurfaceVariant: '#C5D0CA',
  surfaceContainerLowest: '#161C19',
  surfaceContainerLow: '#1A221E',
  surfaceContainer: '#1F2924',
  surfaceContainerHigh: '#24302A',
  primaryContainer: '#047857',
  primaryFixed: '#064E3B',
  secondary: '#C5D0CA',
  secondaryContainer: '#24302A',
  tertiary: '#34D399',
  tertiaryFixed: '#064E3B',
  outline: '#8A9B92',
} as const;

export function resolveBaseColors(appearance: AppearanceMode) {
  return appearance === 'dark' ? darkBase : baseColors;
}


/** Soft dark surfaces — WCAG AA for body text on surface (≥4.5:1) */
export const softDark = {
  primary: '#059669',
  primaryContainer: '#047857',
  primaryFixed: '#064E3B',
  onPrimary: '#FFFFFF',
  surface: '#121814',
  onSurface: '#E8F0EB',
  onSurfaceVariant: '#C5D0CA',
  surfaceContainerLowest: '#1A211C',
  surfaceContainerLow: '#1E2620',
  surfaceContainer: '#242C26',
  surfaceContainerHigh: '#2E3831',
  secondary: '#C5D0CA',
  secondaryContainer: '#2A3530',
  tertiary: '#34D399',
  tertiaryContainer: '#059669',
  tertiaryFixed: '#064E3B',
  outline: '#8A9B92',
  primaryText: '#6EE7B7',
  placeholder: '#AEBBB4',
} as const;

export type ColorScheme = 'light' | 'dark';

export type AppColors = {
  cream: string;
  creamDeep: string;
  white: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  danger: string;
  primary: string;
  primaryText: string;
  placeholder: string;
  charcoal: string;
  amber: string;
  rose: string;
  softRose: string;
  overlay: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  primaryContainer: string;
  primaryFixed: string;
  secondary: string;
  secondaryContainer: string;
  tertiary: string;
  tertiaryFixed: string;
  outline: string;
};

export const lightColors: AppColors = { ...baseColors };

export const darkColors: AppColors = {
  cream: softDark.surface,
  creamDeep: softDark.surfaceContainer,
  white: softDark.surfaceContainerLowest,
  text: softDark.onSurface,
  textMuted: softDark.onSurfaceVariant,
  border: softDark.outline,
  success: softDark.tertiary,
  danger: '#F87171',
  primary: softDark.primary,
  primaryText: softDark.primaryText,
  placeholder: softDark.placeholder,
  charcoal: softDark.onSurface,
  amber: '#FBBF24',
  rose: '#F472B6',
  softRose: '#4C1D3D',
  overlay: 'rgba(0, 0, 0, 0.55)',
  surface: softDark.surface,
  onSurface: softDark.onSurface,
  onSurfaceVariant: softDark.onSurfaceVariant,
  surfaceContainerLowest: softDark.surfaceContainerLowest,
  surfaceContainerLow: softDark.surfaceContainerLow,
  surfaceContainer: softDark.surfaceContainer,
  surfaceContainerHigh: softDark.surfaceContainerHigh,
  primaryContainer: softDark.primaryContainer,
  primaryFixed: softDark.primaryFixed,
  secondary: softDark.secondary,
  secondaryContainer: softDark.secondaryContainer,
  tertiary: softDark.tertiary,
  tertiaryFixed: softDark.tertiaryFixed,
  outline: softDark.outline,
};

export function colorsForScheme(scheme: ColorScheme | undefined | null): AppColors {
  return scheme === 'dark' ? darkColors : lightColors;
}
