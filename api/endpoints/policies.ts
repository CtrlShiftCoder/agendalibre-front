import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { CancellationPolicy } from '@/contracts';

export const policiesApi = {
  get: (opts?: RequestOptions) => apiGet<CancellationPolicy>('/policies', opts),
  put: (body: Partial<CancellationPolicy>, opts?: RequestOptions) =>
    apiPut<CancellationPolicy>('/policies', body, opts),
};
