'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { ImageMetadata } from '@/types';

interface LightboxProps {
  images: ImageMetadata[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const image = images[index];

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext, onClose]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="truncate text-sm">{image.name}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded px-3 py-1 text-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-12">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        >
          ←
        </button>

        <div className="relative h-full w-full">
          {image.imageUrl ? (
            <Image
              src={image.imageUrl}
              alt={image.name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white">
              Preview unavailable
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next"
          className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        >
          →
        </button>
      </div>

      <div className="flex flex-wrap gap-4 px-4 py-3 text-xs text-gray-300">
        {image.width && image.height && (
          <span>
            {image.width} × {image.height}
          </span>
        )}
        {image.fileSize && (
          <span>{(image.fileSize / 1024 / 1024).toFixed(2)} MB</span>
        )}
        {image.takenDate && (
          <span>{new Date(image.takenDate).toLocaleString()}</span>
        )}
        {image.imageUrl && (
          <a
            href={image.imageUrl}
            download
            className="ml-auto text-blue-300 hover:underline"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}
