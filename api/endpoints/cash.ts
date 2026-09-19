import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { DayCashSummary } from '@/contracts';

export const cashApi = {
  day: (
    query: { date: string; professionalId?: string },
    opts?: RequestOptions
  ) => apiGet<DayCashSummary>('/cash/day', { ...opts, query }),
};
