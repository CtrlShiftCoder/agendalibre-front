import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { TeamInvite } from '@/contracts';

export const teamApi = {
  listInvites: (opts?: RequestOptions) =>
    apiGet<TeamInvite[]>('/team/invites', opts),
  createInvite: (
    body: { role?: TeamInvite['role']; businessName?: string },
    opts?: RequestOptions
  ) => apiPost<TeamInvite>('/team/invites', body, opts),
  acceptInvite: (code: string, opts?: RequestOptions) =>
    apiPost<TeamInvite>(`/team/invites/${encodeURIComponent(code)}/accept`, {}, opts),
  removeInvite: (id: string, opts?: RequestOptions) =>
    apiDelete<{ deleted: boolean }>(`/team/invites/${id}`, opts),
};
