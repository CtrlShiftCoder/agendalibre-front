import { apiGet, apiPatch, apiPost, type RequestOptions } from '../client';

import type { ReminderJob, ReminderTemplate } from '@/contracts';

export const remindersApi = {
  templates: (opts?: RequestOptions) =>
    apiGet<ReminderTemplate[]>('/reminders/templates', opts),
  updateTemplate: (
    id: string,
    body: Partial<ReminderTemplate>,
    opts?: RequestOptions
  ) => apiPatch<ReminderTemplate>(`/reminders/templates/${id}`, body, opts),
  jobs: (opts?: RequestOptions) => apiGet<ReminderJob[]>('/reminders/jobs', opts),
  createJob: (body: Partial<ReminderJob>, opts?: RequestOptions) =>
    apiPost<ReminderJob>('/reminders/jobs', body, opts),
};
