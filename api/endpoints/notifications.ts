import { apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { AppNotification, PushPreference } from '@/contracts';

export const notificationsApi = {
  list: (opts?: RequestOptions) =>
    apiGet<AppNotification[]>('/notifications', opts),
  markRead: (id: string, opts?: RequestOptions) =>
    apiPatch<AppNotification>(`/notifications/${id}/read`, {}, opts),
  markAllRead: (opts?: RequestOptions) =>
    apiPost<{ updated: number }>('/notifications/read-all', {}, opts),
  getPreferences: (opts?: RequestOptions) =>
    apiGet<PushPreference>('/notifications/preferences', opts),
  putPreferences: (body: Partial<PushPreference>, opts?: RequestOptions) =>
    apiPut<PushPreference>('/notifications/preferences', body, opts),
};
