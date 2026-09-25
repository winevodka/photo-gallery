import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { buildDriveThumbnailUrl } from '../common/utils/drive-url.util';

/**
 * Drive's `thumbnailLink`/`webContentLink` values are short-lived, so we
 * never trust the stored columns for display \u2014 URLs are always recomputed
 * from the stable `driveFileId` instead.
 */
function withStableUrls(image: Image): Image {
  return {
    ...image,
    thumbnailUrl: buildDriveThumbnailUrl(image.driveFileId, 800),
    imageUrl: buildDriveThumbnailUrl(image.driveFileId, 2048),
  };
}

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async findOne(id: string): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image ${id} not found`);
    }
    return withStableUrls(image);
  }

  async findByAlbum(
    albumId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Image[]; total: number }> {
    const [items, total] = await this.imageRepository.findAndCount({
      where: { albumId },
      order: { takenDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: items.map(withStableUrls), total };
  }
}
