/**
 * Feature flag: when true, front prefers mock HTTP API over local Zustand seed.
 * Override via EXPO_PUBLIC_USE_MOCK_API=true|false
 */
import Constants from 'expo-constants';

function readFlag(): boolean {
  const fromEnv =
    typeof process !== 'undefined'
      ? process.env.EXPO_PUBLIC_USE_MOCK_API
      : undefined;
  const fromExtra = (
    Constants.expoConfig?.extra as { useMockApi?: boolean } | undefined
  )?.useMockApi;
  if (fromEnv === 'true' || fromEnv === '1') return true;
  if (fromEnv === 'false' || fromEnv === '0') return false;
  if (typeof fromExtra === 'boolean') return fromExtra;
  return false;
}

export const USE_MOCK_API = readFlag();

export function isApiModeEnabled(): boolean {
  return USE_MOCK_API;
}
