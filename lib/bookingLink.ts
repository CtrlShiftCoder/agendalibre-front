import type { Niche, Profile } from '@/data/types';

/** Simple slug from business name for public booking URL. */
export function slugFromName(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'mi-negocio';
}

/** Public vitrina path: `/v/slug`. */
export function vitrinaPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, '') || 'mi-negocio';
  return `/v/${clean}`;
}

/** Direct reserve path with query slug. */
export function reservarPath(slug: string): string {
  return `/reservar?slug=${encodeURIComponent(slug)}`;
}

export type PublicLinkInput = {
  /** Preferred: storefront.bookingPath (usually `/v/slug`). */
  bookingPath?: string;
  /** Storefront slug. */
  slug?: string;
  /** Fallback to slugify business / display name. */
  name?: string;
};

/**
 * Resolve public path for copy/share.
 * Prefers storefront `/v/slug` or `/reservar`, else builds from slug/name.
 */
export function publicBookingPath(input: PublicLinkInput): string {
  const raw = input.bookingPath?.trim();
  if (raw?.startsWith('/v/') || raw?.startsWith('/reservar')) {
    return raw;
  }
  if (raw?.startsWith('/')) return raw;

  const slug = (input.slug?.trim() || slugFromName(input.name ?? '')).replace(
    /^\/+|\/+$/g,
    ''
  );
  if (slug) return vitrinaPath(slug);
  return reservarPath('mi-negocio');
}

/** Profile-only path → public `/v/slug` from business name. */
export function bookingPath(profile: Profile): string {
  return publicBookingPath({ name: profile.name });
}

/** Absolute-ish URL for copy/share (web origin when available). */
export function toAbsoluteShareUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${p}`;
  }
  return `https://agendalibre.app${p}`;
}

export function bookingShareUrl(
  profileOrInput: Profile | PublicLinkInput,
  storefront?: { slug?: string; bookingPath?: string; displayName?: string }
): string {
  const isProfile =
    profileOrInput != null &&
    typeof profileOrInput === 'object' &&
    'role' in profileOrInput &&
    'niche' in profileOrInput;

  const path = isProfile
    ? publicBookingPath({
        bookingPath: storefront?.bookingPath,
        slug: storefront?.slug,
        name: storefront?.displayName || (profileOrInput as Profile).name,
      })
    : publicBookingPath(profileOrInput as PublicLinkInput);

  return toAbsoluteShareUrl(path);
}

/** Chile-friendly WhatsApp / share body with business name + link. */
export function bookingShareMessage(
  businessName: string,
  url: string
): string {
  const name = businessName.trim() || 'nuestro negocio';
  return (
    `¡Hola! 👋 Te comparto el link para reservar en *${name}*:\n\n` +
    `${url}\n\n` +
    `Elige tu hora altiro, sin ida y vuelta. ¡Te esperamos!`
  );
}

export function nicheLabel(niche: Niche): string {
  switch (niche) {
    case 'barber':
      return 'Barbería';
    case 'health':
      return 'Salud';
    case 'beauty':
      return 'Belleza';
    default:
      return 'Agenda';
  }
}
