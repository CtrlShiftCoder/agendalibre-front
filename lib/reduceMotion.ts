import { Platform } from 'react-native';

/**
 * Simple reduce-motion gate — no AccessibilityInfo subscription required.
 * - Native: off unless EXPO_PUBLIC_REDUCE_MOTION=1 (or true/yes)
 * - Web: also honors CSS prefers-reduced-motion: reduce (matchMedia)
 */
let override: boolean | null = null;

function envFlag(): boolean {
  try {
    const v = (process.env.EXPO_PUBLIC_REDUCE_MOTION ?? '').toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  } catch {
    return false;
  }
}

function webPrefersReducedMotion(): boolean {
  if (Platform.OS !== 'web') return false;
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Force on/off for tests; pass null to clear. */
export function setReduceMotionOverride(value: boolean | null) {
  override = value;
}

export function prefersReducedMotion(): boolean {
  if (override !== null) return override;
  return envFlag() || webPrefersReducedMotion();
}
