/**
 * Hydrate Zustand from mock HTTP API when available.
 * Soft-fails to Zustand seeds if API is down.
 */
import {
  appointmentsApi,
  authApi,
  businessesApi,
  clientsApi,
  galleryApi,
  notificationsApi,
  professionalsApi,
  remindersApi,
  reviewsApi,
  servicesApi,
  storefrontApi,
  teamApi,
  waitlistApi,
  policiesApi,
  ApiClientError,
  DEFAULT_MOCK_TOKEN,
  getApiToken,
  hydrateSession,
  setApiSession,
} from '@/api';
import { isApiModeEnabled } from '@/lib/apiMode';
import { useAppStore } from '@/store/useAppStore';

export type HydrateOptions = {
  token?: string | null;
  force?: boolean;
};

function stripBiz<T extends { businessId?: string }>(
  rows: T[]
): Omit<T, 'businessId'>[] {
  return rows.map(({ businessId: _b, ...rest }) => rest);
}

/**
 * Pull /auth/me + core collections into the store.
 */

/** Wipe local catalog/booking collections before hydrating a fresh register. */
export function clearBusinessCollections(): void {
  useAppStore.setState({
    services: [],
    clients: [],
    appointments: [],
    waitlist: [],
    reviews: [],
    gallery: [],
    notifications: [],
    teamInvites: [],
    professionals: [],
  });
}

export async function hydrateFromApi(
  opts: HydrateOptions = {}
): Promise<{ ok: boolean; error?: string }> {
  if (!opts.force && !isApiModeEnabled()) {
    return { ok: false, error: 'API mode disabled (EXPO_PUBLIC_USE_MOCK_API)' };
  }

  await hydrateSession();
  const token =
    opts.token ?? getApiToken() ?? DEFAULT_MOCK_TOKEN;

  try {
    const me = await authApi.me({ token });
    const [
      services,
      professionals,
      clients,
      appointments,
      storefront,
      policy,
      waitlist,
      reviews,
      gallery,
      notifications,
      prefs,
      templates,
      invites,
    ] = await Promise.all([
      servicesApi.list({ token }),
      professionalsApi.list({ token }),
      clientsApi.list({ token }),
      appointmentsApi.list(undefined, { token }),
      storefrontApi.get({ token }),
      policiesApi.get({ token }),
      waitlistApi.list({ token }),
      reviewsApi.list(undefined, { token }),
      galleryApi.list(undefined, { token }),
      notificationsApi.list({ token }),
      notificationsApi.getPreferences({ token }),
      remindersApi.templates({ token }),
      teamApi.listInvites({ token }),
    ]);

    const store = useAppStore.getState();
    const profilePatch: Parameters<typeof store.updateProfile>[0] = {
      name: me.data.name,
      authEmail: me.data.email,
      authDone: true,
      role: me.data.role,
      businessId: me.data.businessId,
      activeProfessionalId: me.data.professionalId,
      linkedClientId: me.data.clientId,
      onboardingDone: true,
    };
    if (me.data.businessId) {
      try {
        const biz = await businessesApi.get(me.data.businessId, { token });
        if (Array.isArray(biz.data.blockedDates)) {
          profilePatch.blockedDates = biz.data.blockedDates;
        }
        if (biz.data.hours) {
          profilePatch.hours = biz.data.hours;
        }
        if (biz.data.address) {
          profilePatch.address = biz.data.address;
        }
      } catch {
        /* soft — keep local blockedDates */
      }
    }
    store.updateProfile(profilePatch);

    useAppStore.setState({
      services: stripBiz(services.data) as typeof store.services,
      professionals: stripBiz(professionals.data) as typeof store.professionals,
      clients: stripBiz(clients.data) as typeof store.clients,
      appointments: stripBiz(appointments.data) as typeof store.appointments,
      storefront: storefront.data,
      cancellationPolicy: policy.data,
      waitlist: waitlist.data,
      reviews: reviews.data,
      gallery: gallery.data,
      notifications: notifications.data,
      pushPreferences: prefs.data,
      reminderTemplates: templates.data,
      teamInvites: invites.data,
    });

    if (!getApiToken()) {
      await setApiSession(token, me.data);
    }

    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof ApiClientError
        ? e.message
        : e instanceof Error
          ? e.message
          : 'hydrate failed';
    return { ok: false, error: msg };
  }
}

export async function syncFromApi(): Promise<void> {
  await hydrateFromApi();
}
