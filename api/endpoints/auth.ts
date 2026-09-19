import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { AuthSession, AuthUser, LoginRequest, RegisterRequest } from '@/contracts';

export const authApi = {
  login: (body: LoginRequest, opts?: RequestOptions) =>
    apiPost<AuthSession>('/auth/login', body, opts),
  register: (body: RegisterRequest, opts?: RequestOptions) =>
    apiPost<AuthSession>('/auth/register', body, opts),
  me: (opts?: RequestOptions) => apiGet<AuthUser>('/auth/me', opts),
};
