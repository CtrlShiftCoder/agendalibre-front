import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

export const healthApi = {
  check: (opts?: RequestOptions) =>
    apiGet<{ status: string; service: string; version?: string; time: string; uptimeSec?: number }>('/health', opts),
};
