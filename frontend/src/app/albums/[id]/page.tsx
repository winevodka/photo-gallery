import { notFound } from 'next/navigation';
import { getAlbum } from '@/lib/api';
import { Gallery } from '@/components/Gallery';

export default async function AlbumPage({
  params,
}: {
  params: { id: string };
}) {
  let album;
  try {
    album = await getAlbum(params.id);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-4 text-sm text-gray-500">
        <a href="/">Albums</a> / <span>{album!.name}</span>
      </nav>
      <h1 className="mb-1 text-3xl font-bold">{album!.name}</h1>
      {album!.description && (
        <p className="mb-6 text-gray-500">{album!.description}</p>
      )}
      <p className="mb-6 text-sm text-gray-400">
        {album!.images.total} photo{album!.images.total === 1 ? '' : 's'}
      </p>

      <Gallery
        albumId={album!.id}
        initialImages={album!.images.items}
        totalImages={album!.images.total}
      />
    </main>
  );
}
