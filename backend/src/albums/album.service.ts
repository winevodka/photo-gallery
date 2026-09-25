import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './album.entity';
import { Image } from '../images/image.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { extractDriveFolderId } from '../common/utils/drive-url.util';

@Injectable()
export class AlbumService {
  private readonly logger = new Logger(AlbumService.name);

  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async create(dto: CreateAlbumDto): Promise<Album> {
    const folderId = extractDriveFolderId(dto.folderUrl);
    const album = this.albumRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      folderId,
      coverImage: dto.coverImage ?? null,
    });
    const saved = await this.albumRepository.save(album);
    // Kick off an initial sync so the album has photos right away. If the
    // sync fails (e.g. folder not shared yet, transient Drive API error),
    // don't fail album creation — the album already exists and can be
    // retried later via the sync endpoint/button.
    try {
      await this.sync(saved.id);
    } catch (error) {
      this.logger.error(
        `Initial sync failed for album ${saved.id}: ${(error as Error).message}`,
      );
    }
    return this.findOne(saved.id);
  }


  async findAll(
    page: number,
    limit: number,
  ): Promise<{ items: Album[]; total: number }> {
    const [items, total] = await this.albumRepository.findAndCount({
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findOne(id: string): Promise<Album> {
    const album = await this.albumRepository.findOne({ where: { id } });
    if (!album) {
      throw new NotFoundException(`Album ${id} not found`);
    }
    return album;
  }

  async remove(id: string): Promise<void> {
    const album = await this.findOne(id);
    // Image rows have onDelete: 'CASCADE' on their album relation, so this
    // also removes all synced images for the album.
    await this.albumRepository.remove(album);
  }

  /**
   * Fetches the current file list from Google Drive for the album's folder
   * and upserts image metadata into the database.
   */
  async sync(albumId: string): Promise<{ synced: number }> {
    const album = await this.findOne(albumId);
    const driveImages = await this.googleDriveService.listImagesInFolder(
      album.folderId,
    );

    for (const driveImage of driveImages) {
      await this.imageRepository.upsert(
        {
          albumId: album.id,
          driveFileId: driveImage.id,
          name: driveImage.name,
          thumbnailUrl: driveImage.thumbnailUrl,
          imageUrl: driveImage.imageUrl,
          fileSize: driveImage.fileSize,
          width: driveImage.width,
          height: driveImage.height,
          takenDate: driveImage.takenDate,
        },
        ['driveFileId'],
      );
    }

    if (driveImages.length > 0) {
      // Store the stable file ID, not the short-lived thumbnailLink — the
      // actual display URL is computed on read via buildDriveThumbnailUrl().
      // Always refresh (not just when unset) so albums synced before this
      // fix self-heal instead of keeping a stale/expired URL forever.
      album.coverImage = driveImages[0].id;
      await this.albumRepository.save(album);
    } else {
      // touch updatedAt
      await this.albumRepository.save(album);
    }

    return { synced: driveImages.length };
  }
}
