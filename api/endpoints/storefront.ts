import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { PublicStorefront, PublicStorefrontView } from '@/contracts';

export const storefrontApi = {
  get: (opts?: RequestOptions) => apiGet<PublicStorefront>('/storefront', opts),
  put: (body: Partial<PublicStorefront>, opts?: RequestOptions) =>
    apiPut<PublicStorefront>('/storefront', body, opts),
  publicBySlug: (slug: string, opts?: RequestOptions) =>
    apiGet<PublicStorefrontView>(`/public/v/${encodeURIComponent(slug)}`, opts),
};
