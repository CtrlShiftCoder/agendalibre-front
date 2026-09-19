import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { Professional } from '@/contracts';

export const professionalsApi = {
  list: (opts?: RequestOptions) => apiGet<Professional[]>('/professionals', opts),
  get: (id: string, opts?: RequestOptions) =>
    apiGet<Professional>(`/professionals/${id}`, opts),
  create: (body: Omit<Professional, 'id' | 'businessId'>, opts?: RequestOptions) =>
    apiPost<Professional>('/professionals', body, opts),
  update: (id: string, body: Partial<Professional>, opts?: RequestOptions) =>
    apiPatch<Professional>(`/professionals/${id}`, body, opts),
  remove: (id: string, opts?: RequestOptions) =>
    apiDelete<{ deleted: boolean }>(`/professionals/${id}`, opts),
};
