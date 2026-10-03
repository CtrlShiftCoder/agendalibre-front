import { router } from 'expo-router';

/** Volver; si no hay historial (entrada directa por URL) va a Hoy. */
export function goBack(fallback: string = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}
