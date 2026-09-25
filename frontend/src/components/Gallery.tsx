'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getAlbum } from '@/lib/api';
import type { ImageMetadata } from '@/types';
import { Lightbox } from './Lightbox';

const PAGE_SIZE = 40;

interface GalleryProps {
  albumId: string;
  initialImages: ImageMetadata[];
  totalImages: number;
}

export function Gallery({ albumId, initialImages, totalImages }: GalleryProps) {
  const [images, setImages] = useState(initialImages);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = images.length < totalImages;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const album = await getAlbum(albumId, nextPage, PAGE_SIZE);
      setImages((prev) => [...prev, ...album.images.items]);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [albumId, hasMore, loading, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="block w-full overflow-hidden rounded-md bg-gray-100"
          >
            {image.thumbnailUrl ? (
              <Image
                src={image.thumbnailUrl}
                alt={image.name}
                width={image.width ?? 400}
                height={image.height ?? 300}
                loading="lazy"
                className="w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-xs text-gray-400">
                {image.name}
              </div>
            )}
          </button>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="py-8 text-center text-sm text-gray-400">
          {loading ? 'Loading more photos…' : ''}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}
