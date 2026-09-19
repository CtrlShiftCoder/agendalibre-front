export {
  API_BASE_URL,
  ApiClientError,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
} from './client';
export type { RequestOptions } from './client';
export type * from './types';

export {
  clientCacheClear,
  clientCacheInvalidate,
  invalidateAfterMutation,
  CLIENT_CACHE_TTL_MS,
} from './cache';
export {
  getApiToken,
  setApiSession,
  clearApiSession,
  hydrateSession,
  getStoredAuthUser,
  DEFAULT_MOCK_TOKEN,
} from './session';

export { healthApi } from './endpoints/health';
export { authApi } from './endpoints/auth';
export { businessesApi } from './endpoints/businesses';
export { servicesApi } from './endpoints/services';
export { professionalsApi } from './endpoints/professionals';
export { clientsApi } from './endpoints/clients';
export { appointmentsApi } from './endpoints/appointments';
export { availabilityApi } from './endpoints/availability';
export { policiesApi } from './endpoints/policies';
export { waitlistApi } from './endpoints/waitlist';
export { storefrontApi } from './endpoints/storefront';
export { cashApi } from './endpoints/cash';
export { remindersApi } from './endpoints/reminders';
export { honorariosApi } from './endpoints/honorarios';
export { teamApi } from './endpoints/team';
export { notificationsApi } from './endpoints/notifications';
export { reviewsApi } from './endpoints/reviews';
export { galleryApi } from './endpoints/gallery';
