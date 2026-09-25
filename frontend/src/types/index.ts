export interface AlbumSummary {
  id: string;
  name: string;
  description: string | null;
  folderId: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImageMetadata {
  id: string;
  albumId: string;
  driveFileId: string;
  name: string;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  takenDate: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AlbumDetail extends AlbumSummary {
  images: Paginated<ImageMetadata>;
}
