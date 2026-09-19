import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { WaitlistEntry } from '@/contracts';

export const waitlistApi = {
  list: (opts?: RequestOptions) => apiGet<WaitlistEntry[]>('/waitlist', opts),
  create: (body: Partial<WaitlistEntry>, opts?: RequestOptions) =>
    apiPost<WaitlistEntry>('/waitlist', body, opts),
  update: (id: string, body: Partial<WaitlistEntry>, opts?: RequestOptions) =>
    apiPatch<WaitlistEntry>(`/waitlist/${id}`, body, opts),
};
