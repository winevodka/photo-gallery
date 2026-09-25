import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { ImageService } from '../images/image.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { buildDriveThumbnailUrl } from '../common/utils/drive-url.util';
import { Album } from './album.entity';

function withCoverImageUrl(album: Album) {
  // Albums synced before this fix have a stale, already-expired URL stored
  // directly in coverImage. Treat those as unset until the next sync
  // refreshes them to a bare driveFileId.
  const isLegacyUrl = album.coverImage?.includes('://');
  return {
    ...album,
    coverImage:
      album.coverImage && !isLegacyUrl
        ? buildDriveThumbnailUrl(album.coverImage, 800)
        : null,
  };
}

@Controller('albums')
export class AlbumController {
  constructor(
    private readonly albumService: AlbumService,
    private readonly imageService: ImageService,
  ) {}

  @Get()
  async findAll(@Query() { page, limit }: PaginationQueryDto) {
    const { items, total } = await this.albumService.findAll(
      page ?? 1,
      limit ?? 20,
    );
    return {
      items: items.map(withCoverImageUrl),
      total,
      page: page ?? 1,
      limit: limit ?? 20,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() { page, limit }: PaginationQueryDto,
  ) {
    const album = await this.albumService.findOne(id);
    const { items, total } = await this.imageService.findByAlbum(
      id,
      page ?? 1,
      limit ?? 40,
    );
    return {
      ...withCoverImageUrl(album),
      images: { items, total, page: page ?? 1, limit: limit ?? 40 },
    };
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateAlbumDto) {
    return this.albumService.create(dto);
  }

  @Post(':id/sync')
  @UseGuards(AdminGuard)
  sync(@Param('id') id: string) {
    return this.albumService.sync(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.albumService.remove(id);
  }
}
