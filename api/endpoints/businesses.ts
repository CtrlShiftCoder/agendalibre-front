import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { Business } from '@/contracts';

export const businessesApi = {
  list: (opts?: RequestOptions) => apiGet<Business[]>('/businesses', opts),
  get: (id: string, opts?: RequestOptions) => apiGet<Business>(`/businesses/${id}`, opts),
  create: (body: Partial<Business>, opts?: RequestOptions) =>
    apiPost<Business>('/businesses', body, opts),
  update: (id: string, body: Partial<Business>, opts?: RequestOptions) =>
    apiPatch<Business>(`/businesses/${id}`, body, opts),
};
