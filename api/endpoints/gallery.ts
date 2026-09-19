import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type RequestOptions } from '../client';

import type { GalleryItem } from '@/contracts';

export const galleryApi = {
  list: (query?: { visible?: boolean }, opts?: RequestOptions) =>
    apiGet<GalleryItem[]>('/gallery', {
      ...opts,
      query: query?.visible != null ? { visible: String(query.visible) } : undefined,
    }),
  create: (body: Partial<GalleryItem>, opts?: RequestOptions) =>
    apiPost<GalleryItem>('/gallery', body, opts),
  update: (id: string, body: Partial<GalleryItem>, opts?: RequestOptions) =>
    apiPatch<GalleryItem>(`/gallery/${id}`, body, opts),
  remove: (id: string, opts?: RequestOptions) =>
    apiDelete<{ deleted: boolean }>(`/gallery/${id}`, opts),
};
