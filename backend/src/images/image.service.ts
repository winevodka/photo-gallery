import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';

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
    return image;
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
    return { items, total };
  }
}
