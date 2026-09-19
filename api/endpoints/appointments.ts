import { apiGet, apiPatch, apiPost, type RequestOptions } from '../client';

import type { Appointment } from '@/contracts';

function newUuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  // Fallback for older runtimes
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const n = (Math.random() * 16) | 0;
    const v = ch === 'x' ? n : (n & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const appointmentsApi = {
  list: (
    query?: { date?: string; clientId?: string },
    opts?: RequestOptions
  ) => apiGet<Appointment[]>('/appointments', { ...opts, query }),
  get: (id: string, opts?: RequestOptions) =>
    apiGet<Appointment>(`/appointments/${id}`, opts),
  /**
   * Create appointment. Sends Idempotency-Key (uuid) by default so retries
   * replay the same result on the mock API.
   */
  create: (body: Partial<Appointment>, opts?: RequestOptions) =>
    apiPost<Appointment>('/appointments', body, {
      ...opts,
      idempotencyKey: opts?.idempotencyKey ?? newUuid(),
    }),
  update: (id: string, body: Partial<Appointment>, opts?: RequestOptions) =>
    apiPatch<Appointment>(`/appointments/${id}`, body, opts),
};
