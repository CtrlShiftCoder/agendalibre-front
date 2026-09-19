import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { HonorariosQuote, HonorariosQuoteRequest } from '@/contracts';

export const honorariosApi = {
  quote: (body: HonorariosQuoteRequest, opts?: RequestOptions) =>
    apiPost<HonorariosQuote>('/honorarios/quote', body, opts),
};
