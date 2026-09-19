/**
 * Ephemeral API connectivity UI state (not persisted).
 */
import { create } from 'zustand';

type ConnectivityState = {
  apiOffline: boolean;
  bannerDismissed: boolean;
  setApiOffline: (offline: boolean) => void;
  dismissBanner: () => void;
  /** Clear dismiss so a new outage can show again */
  resetBanner: () => void;
};

export const useConnectivity = create<ConnectivityState>((set) => ({
  apiOffline: false,
  bannerDismissed: false,
  setApiOffline: (offline) =>
    set((s) => ({
      apiOffline: offline,
      // Coming back online clears dismiss so future outages show again
      bannerDismissed: offline ? s.bannerDismissed : false,
    })),
  dismissBanner: () => set({ bannerDismissed: true }),
  resetBanner: () => set({ bannerDismissed: false }),
}));

export function selectShowOfflineBanner(s: ConnectivityState): boolean {
  return s.apiOffline && !s.bannerDismissed;
}
