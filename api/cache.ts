/**
 * Lightweight client GET cache (TTL 45s) + invalidate helpers.
 */

type Entry = { value: unknown; expiresAt: number };

const store = new Map<string, Entry>();
export const CLIENT_CACHE_TTL_MS = 45_000;

function makeKey(method: string, url: string): string {
  return `${method.toUpperCase()} ${url}`;
}

export function clientCacheGet<T>(method: string, url: string): T | undefined {
  const key = makeKey(method, url);
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function clientCacheSet(
  method: string,
  url: string,
  value: unknown,
  ttlMs = CLIENT_CACHE_TTL_MS
): void {
  store.set(makeKey(method, url), { value, expiresAt: Date.now() + ttlMs });
}

/** Invalidate by URL substring (e.g. '/services', '/policies') */
export function clientCacheInvalidate(match: string): void {
  for (const key of store.keys()) {
    if (key.includes(match)) store.delete(key);
  }
}

export function clientCacheClear(): void {
  store.clear();
}

/** Call after mutations that affect common lists */
export function invalidateAfterMutation(path: string): void {
  const p = path.split('?')[0] ?? path;
  if (p.includes('/services')) {
    clientCacheInvalidate('/services');
    clientCacheInvalidate('/public/v/');
  } else if (p.includes('/policies')) {
    clientCacheInvalidate('/policies');
    clientCacheInvalidate('/public/v/');
  } else if (p.includes('/storefront')) {
    clientCacheInvalidate('/storefront');
    clientCacheInvalidate('/public/v/');
  } else if (p.includes('/appointments')) {
    clientCacheInvalidate('/appointments');
    clientCacheInvalidate('/cash/');
  } else if (p.includes('/clients')) {
    clientCacheInvalidate('/clients');
  } else if (p.includes('/professionals') || p.includes('/team')) {
    clientCacheInvalidate('/professionals');
    clientCacheInvalidate('/team');
  } else if (p.includes('/waitlist')) {
    clientCacheInvalidate('/waitlist');
  } else if (p.includes('/reviews')) {
    clientCacheInvalidate('/reviews');
    clientCacheInvalidate('/public/v/');
  } else if (p.includes('/gallery')) {
    clientCacheInvalidate('/gallery');
    clientCacheInvalidate('/public/v/');
  } else if (p.includes('/notifications')) {
    clientCacheInvalidate('/notifications');
  } else if (p.includes('/reminders')) {
    clientCacheInvalidate('/reminders');
  } else {
    // broad fallback for unknown mutations
    clientCacheInvalidate(p.replace(/\/[^/]+$/, ''));
  }
}
