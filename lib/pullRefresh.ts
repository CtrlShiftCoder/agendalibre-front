/**
 * Pull-to-refresh: hydrateFromApi when mock API mode is on,
 * otherwise soft-bump local store timestamps.
 */
import { healthApi } from '@/api';
import { isApiModeEnabled } from '@/lib/apiMode';
import { useConnectivity } from '@/store/useConnectivity';
import { hydrateFromApi } from '@/store/syncFromApi';
import { useAppStore } from '@/store/useAppStore';

export function softReloadStoreTimestamps(): void {
  const now = new Date().toISOString();
  useAppStore.setState((s) => ({
    storefront: { ...s.storefront, updatedAt: now },
  }));
}

/**
 * Ping /health. On failure marks API offline.
 * Does NOT clear offline on success — callers decide (hydrate may still have failed).
 */
export async function pingApiHealth(): Promise<boolean> {
  try {
    await healthApi.check({ skipCache: true });
    return true;
  } catch {
    useConnectivity.getState().setApiOffline(true);
    return false;
  }
}

/**
 * Refresh data for list screens.
 * - API mode: hydrateFromApi (+ mark offline on failure)
 * - Local mode: soft-reload timestamps
 */
export async function refreshAgendaData(): Promise<{ ok: boolean; offline?: boolean }> {
  if (isApiModeEnabled()) {
    const res = await hydrateFromApi();
    if (!res.ok) {
      useConnectivity.getState().setApiOffline(true);
      await pingApiHealth();
      return { ok: false, offline: true };
    }
    const healthy = await pingApiHealth();
    if (healthy) {
      useConnectivity.getState().setApiOffline(false);
    }
    return { ok: true, offline: !healthy };
  }

  softReloadStoreTimestamps();
  return { ok: true };
}
