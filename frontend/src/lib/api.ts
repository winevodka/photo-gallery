import type { AlbumDetail, AlbumSummary, Paginated } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function getAlbums(page = 1, limit = 20) {
  return apiGet<Paginated<AlbumSummary>>(
    `/albums?page=${page}&limit=${limit}`,
  );
}

export function getAlbum(id: string, page = 1, limit = 40) {
  return apiGet<AlbumDetail>(`/albums/${id}?page=${page}&limit=${limit}`);
}
