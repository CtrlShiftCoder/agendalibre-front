import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { Review } from '@/contracts';

export const reviewsApi = {
  list: (query?: { visible?: boolean }, opts?: RequestOptions) =>
    apiGet<Review[]>('/reviews', {
      ...opts,
      query: query?.visible != null ? { visible: String(query.visible) } : undefined,
    }),
  create: (body: Partial<Review>, opts?: RequestOptions) =>
    apiPost<Review>('/reviews', body, opts),
  update: (id: string, body: Partial<Review>, opts?: RequestOptions) =>
    apiPatch<Review>(`/reviews/${id}`, body, opts),
};
