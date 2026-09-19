import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { Service } from '@/contracts';

export const servicesApi = {
  list: (opts?: RequestOptions) => apiGet<Service[]>('/services', opts),
  get: (id: string, opts?: RequestOptions) => apiGet<Service>(`/services/${id}`, opts),
  create: (body: Omit<Service, 'id' | 'businessId'>, opts?: RequestOptions) =>
    apiPost<Service>('/services', body, opts),
  update: (id: string, body: Partial<Service>, opts?: RequestOptions) =>
    apiPatch<Service>(`/services/${id}`, body, opts),
  remove: (id: string, opts?: RequestOptions) =>
    apiDelete<{ deleted: boolean }>(`/services/${id}`, opts),
};
