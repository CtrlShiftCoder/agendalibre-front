import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { AvailabilitySlot } from '@/contracts';

export const availabilityApi = {
  list: (
    query: {
      date: string;
      serviceId?: string;
      professionalId?: string;
      businessId?: string;
    },
    opts?: RequestOptions
  ) => apiGet<AvailabilitySlot[]>('/availability', { ...opts, query }),
};
