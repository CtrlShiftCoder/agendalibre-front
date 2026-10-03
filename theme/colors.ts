/**
 * Tokens del design system de Stitch "Soloist Modern" (proyecto Mobile Scheduling MVP UX,
 * assets/fb61437a1cba42cea0cffe9596e40d81) — perfil profesional / persona natural.
 * El nombre `flujo` se mantiene para no romper imports existentes.
 * Fuente: namedColors de Stitch. Ajustes AA marcados con "AA".
 */
export const flujo = {
  /** Stitch primary */
  primary: '#00685F',
  /** Stitch primary_container (texto blanco 4.65:1) */
  primaryContainer: '#008378',
  /** Mint wash de Stitch (chips/estado activo) */
  primaryFixed: '#D1FAE5',
  onPrimary: '#FFFFFF',
  /** Stitch surface */
  surface: '#F8F9FF',
  /** Stitch on_surface */
  onSurface: '#0B1C30',
  /** Stitch on_surface_variant */
  onSurfaceVariant: '#3D4947',
  surfaceContainerLowest: '#FFFFFF',
  /** Stitch surface_container_low */
  surfaceContainerLow: '#EFF4FF',
  /** Stitch surface_container */
  surfaceContainer: '#E5EEFF',
  /** Stitch surface_container_high */
  surfaceContainerHigh: '#DCE9FF',
  /** Stitch secondary */
  secondary: '#565E74',
  /** Stitch secondary_container */
  secondaryContainer: '#DAE2FD',
  /** Verde de éxito (Stitch status Confirmed text #065F46 / mint) — no es el tertiary ámbar de Stitch */
  tertiary: '#047857',
  tertiaryContainer: '#008378',
  tertiaryFixed: '#ECFDF5',
  /** Stitch outline #6D7A77 daba 4.47:1 → oscurecido a #5A6966 (AA 5.76:1 sobre blanco) */
  outline: '#5A6966',
  /** Links / precios / etiquetas sobre blanco o mint (AA 6.68:1) */
  primaryText: '#00685F',
  /** Placeholder — AA sobre blanco/surface (≥4.5:1) */
  placeholder: '#566B67',
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
  danger: '#BA1A1A',
  primary: flujo.primary,
  primaryText: flujo.primaryText,
  placeholder: flujo.placeholder,
  charcoal: '#0F172A',
  amber: '#825100',
  rose: '#BE185D',
  softRose: '#FCE7F3',
  overlay: 'rgba(15, 23, 42, 0.45)',
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
    accent: '#825100',
    onPrimary: '#FFFFFF',
    tabActive: flujo.primary,
    surfaceTint: flujo.primaryFixed,
    gradient: [flujo.primary, flujo.primaryContainer],
    heroGradient: ['#0F172A', '#213145'],
  },
  health: {
    id: 'health',
    label: 'Salud',
    primary: flujo.primary,
    primarySoft: flujo.primaryContainer,
    accent: '#047857',
    onPrimary: '#FFFFFF',
    tabActive: flujo.primary,
    surfaceTint: '#ECFDF5',
    gradient: [flujo.primary, flujo.primaryContainer],
    heroGradient: ['#00403B', flujo.primary],
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
    gradient: [flujo.primary, flujo.primaryContainer],
    heroGradient: [flujo.primary, '#F472B6'],
  },
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  /** Stitch label font (cifras CLP, etiquetas, chips) */
  label: 'SpaceGrotesk_500Medium',
  labelSemibold: 'SpaceGrotesk_600SemiBold',
  labelBold: 'SpaceGrotesk_700Bold',
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

/** Stitch ROUND_EIGHT: DEFAULT 8 · md 12 · lg 16 · xl 24 · pills 9999 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
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
  shadowColor: '#0F172A',
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
  /** Selected day chip — soft primary glow rgba(0,131,120,0.35) */
  primaryGlow: {
    shadowColor: 'rgba(0, 131, 120, 1)',
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
  cream: '#0B1522',
  creamDeep: '#1A2A42',
  white: '#101C2D',
  text: '#EAF1FF',
  textMuted: '#B9C6D6',
  border: '#8FA0A8',
  success: '#4ADE80',
  danger: '#FFB4AB',
  primary: '#008378',
  primaryText: '#6BD8CB',
  placeholder: '#9AA9BA',
  charcoal: '#EAF1FF',
  amber: '#FBBF24',
  rose: '#F9A8D4',
  softRose: '#3B1F2B',
  overlay: 'rgba(0, 0, 0, 0.55)',
  surface: '#0B1522',
  onSurface: '#EAF1FF',
  onSurfaceVariant: '#B9C6D6',
  surfaceContainerLowest: '#101C2D',
  surfaceContainerLow: '#142238',
  surfaceContainer: '#1A2A42',
  surfaceContainerHigh: '#22344F',
  primaryContainer: '#00685F',
  primaryFixed: '#00403B',
  secondary: '#B9C6D6',
  secondaryContainer: '#22344F',
  tertiary: '#4ADE80',
  tertiaryFixed: '#00403B',
  outline: '#8FA0A8',
} as const;

export function resolveBaseColors(appearance: AppearanceMode) {
  return appearance === 'dark' ? darkBase : baseColors;
}


/** Soft dark surfaces — WCAG AA for body text on surface (≥4.5:1) */
export const softDark = {
  primary: '#008378',
  primaryContainer: '#00685F',
  primaryFixed: '#00403B',
  onPrimary: '#FFFFFF',
  surface: '#0B1522',
  onSurface: '#EAF1FF',
  onSurfaceVariant: '#B9C6D6',
  surfaceContainerLowest: '#101C2D',
  surfaceContainerLow: '#142238',
  surfaceContainer: '#1A2A42',
  surfaceContainerHigh: '#22344F',
  secondary: '#B9C6D6',
  secondaryContainer: '#22344F',
  tertiary: '#4ADE80',
  tertiaryContainer: '#008378',
  tertiaryFixed: '#00403B',
  outline: '#8FA0A8',
  primaryText: '#6BD8CB',
  placeholder: '#9AA9BA',
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
  /** Hero / tarjeta destacada [heroFrom → heroTo] */
  heroFrom: string;
  heroTo: string;
  /** Acento vibrante (gráficos, insignias) */
  accent: string;
  accentSoft: string;
  /** Texto sobre accent (AA) */
  onAccent: string;
};

export const lightColors: AppColors = {
  ...baseColors,
  heroFrom: '#00403B',
  heroTo: '#00685F',
  accent: '#008378',
  accentSoft: '#D1FAE5',
  onAccent: '#FFFFFF',
};

export const darkColors: AppColors = {
  cream: softDark.surface,
  creamDeep: softDark.surfaceContainer,
  white: softDark.surfaceContainerLowest,
  text: softDark.onSurface,
  textMuted: softDark.onSurfaceVariant,
  border: softDark.outline,
  success: softDark.tertiary,
  danger: '#FFB4AB',
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
  heroFrom: '#00403B',
  heroTo: '#00685F',
  accent: '#008378',
  accentSoft: '#00403B',
  onAccent: '#FFFFFF',
};

/**
 * Paletas por perfil:
 *  - teal   → Soloist Modern (persona_natural, trabajador, cliente)
 *  - indigo → Modern Editorial Multi-Theme Engine (admin del negocio / empresa)
 */
export type PaletteId = 'teal' | 'indigo';

/** Stitch assets/24b81c80… (Modern Editorial): primary #2A14B4, container #4338CA, surface #FAF8FF… */
export const indigoLight: AppColors = {
  ...lightColors,
  cream: '#FAF8FF',
  creamDeep: '#EAEDFF',
  white: '#FFFFFF',
  text: '#131B2E',
  textMuted: '#464554',
  border: '#6B6A7C',
  success: '#047857',
  primary: '#2A14B4',
  primaryText: '#2A14B4',
  placeholder: '#5F5E70',
  charcoal: '#131B2E',
  surface: '#FAF8FF',
  onSurface: '#131B2E',
  onSurfaceVariant: '#464554',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F2F3FF',
  surfaceContainer: '#EAEDFF',
  surfaceContainerHigh: '#E2E7FF',
  primaryContainer: '#4338CA',
  primaryFixed: '#E3DFFF',
  secondary: '#006A61',
  secondaryContainer: '#86F2E4',
  tertiary: '#047857',
  tertiaryFixed: '#E6F6EF',
  outline: '#6B6A7C',
  heroFrom: '#1B0C7A',
  heroTo: '#4338CA',
  accent: '#006A61',
  accentSoft: '#86F2E4',
  onAccent: '#FFFFFF',
};

export const indigoDark: AppColors = {
  ...darkColors,
  cream: '#0F1226',
  creamDeep: '#232A4D',
  white: '#161A33',
  text: '#E6E8FF',
  textMuted: '#C3C5DC',
  border: '#9A9BB8',
  success: '#4ADE80',
  primary: '#4338CA',
  primaryText: '#C3C0FF',
  placeholder: '#A3A5C0',
  charcoal: '#E6E8FF',
  surface: '#0F1226',
  onSurface: '#E6E8FF',
  onSurfaceVariant: '#C3C5DC',
  surfaceContainerLowest: '#161A33',
  surfaceContainerLow: '#1B2040',
  surfaceContainer: '#232A4D',
  surfaceContainerHigh: '#2C3560',
  primaryContainer: '#2A14B4',
  primaryFixed: '#2A2670',
  secondary: '#6BD8CB',
  secondaryContainer: '#00504A',
  tertiary: '#4ADE80',
  tertiaryFixed: '#0E3B2B',
  outline: '#9A9BB8',
  heroFrom: '#1B0C7A',
  heroTo: '#4338CA',
  accent: '#6BD8CB',
  accentSoft: '#00504A',
  onAccent: '#00201D',
};

export function colorsForScheme(
  scheme: ColorScheme | undefined | null,
  palette: PaletteId = 'teal'
): AppColors {
  if (palette === 'indigo') return scheme === 'dark' ? indigoDark : indigoLight;
  return scheme === 'dark' ? darkColors : lightColors;
}

/** Tokens de tema (botones, tabs, gradientes) según paleta del perfil. */
export function themeForPalette(t: ThemeTokens, palette: PaletteId): ThemeTokens {
  if (palette !== 'indigo') return t;
  return {
    ...t,
    primary: '#2A14B4',
    primarySoft: '#4338CA',
    accent: '#006A61',
    tabActive: '#2A14B4',
    surfaceTint: '#E3DFFF',
    gradient: ['#2A14B4', '#4338CA'],
    heroGradient: ['#1B0C7A', '#4338CA'],
  };
}
