import Link from 'next/link';
import Image from 'next/image';
import { getAlbums } from '@/lib/api';

export default async function HomePage() {
  let albums;
  try {
    ({ items: albums } = await getAlbums());
  } catch (error) {
    console.error('Failed to load albums:', error);
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold">Albums</h1>
        <p className="text-red-500">
          Không thể kết nối tới backend API. Kiểm tra biến môi trường
          NEXT_PUBLIC_API_BASE_URL và đảm bảo backend đang chạy.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Albums</h1>

      {albums.length === 0 ? (
        <p className="text-gray-500">
          No albums yet. Add a Google Drive folder from the admin API to get
          started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="group overflow-hidden rounded-lg border border-gray-200 shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full bg-gray-100">
                {album.coverImage ? (
                  <Image
                    src={album.coverImage}
                    alt={album.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    No cover
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold">{album.name}</h2>
                {album.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {album.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
