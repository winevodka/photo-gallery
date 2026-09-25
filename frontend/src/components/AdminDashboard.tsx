'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AlbumSummary } from '@/types';

export default function AdminDashboard({
  initialAlbums,
}: {
  initialAlbums: AlbumSummary[];
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [folderUrl, setFolderUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await fetch('/api/admin/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, folderUrl }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? 'Tạo album thất bại');
      return;
    }

    setName('');
    setFolderUrl('');
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa album này và toàn bộ ảnh đã sync? Không thể hoàn tác.')) {
      return;
    }
    setBusyId(id);
    setError(null);

    const res = await fetch(`/api/admin/albums/${id}`, { method: 'DELETE' });

    setBusyId(null);

    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? 'Xóa album thất bại');
      return;
    }

    router.refresh();
  }

  async function handleSync(id: string) {
    setBusyId(id);
    setError(null);

    const res = await fetch(`/api/admin/albums/${id}/sync`, {
      method: 'POST',
    });

    setBusyId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? 'Sync thất bại');
      return;
    }

    router.refresh();
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin — Albums</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 underline"
        >
          Đăng xuất
        </button>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-10 flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Tên album</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">
            Google Drive folder URL
          </label>
          <input
            value={folderUrl}
            onChange={(e) => setFolderUrl(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
            placeholder="https://drive.google.com/drive/folders/..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {creating ? 'Đang tạo...' : 'Thêm album'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {initialAlbums.length === 0 ? (
        <p className="text-gray-500">Chưa có album nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {initialAlbums.map((album) => (
            <li
              key={album.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold">{album.name}</p>
                <p className="text-sm text-gray-500">{album.folderId}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSync(album.id)}
                  disabled={busyId === album.id}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {busyId === album.id ? '...' : 'Sync'}
                </button>
                <button
                  onClick={() => handleDelete(album.id)}
                  disabled={busyId === album.id}
                  className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
                >
                  {busyId === album.id ? '...' : 'Xóa'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
