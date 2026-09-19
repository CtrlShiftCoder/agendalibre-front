import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { Client } from '@/contracts';

export const clientsApi = {
  list: (opts?: RequestOptions) => apiGet<Client[]>('/clients', opts),
  get: (id: string, opts?: RequestOptions) => apiGet<Client>(`/clients/${id}`, opts),
  /** Pass opts.idempotencyKey to send Idempotency-Key (optional). */
  create: (body: Partial<Client>, opts?: RequestOptions) =>
    apiPost<Client>('/clients', body, opts),
  update: (id: string, body: Partial<Client>, opts?: RequestOptions) =>
    apiPatch<Client>(`/clients/${id}`, body, opts),
  remove: (id: string, opts?: RequestOptions) =>
    apiDelete<{ deleted: boolean }>(`/clients/${id}`, opts),
};
