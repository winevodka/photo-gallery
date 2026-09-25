import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { ImageService } from '../images/image.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

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
    return { items, total, page: page ?? 1, limit: limit ?? 20 };
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
      ...album,
      images: { items, total, page: page ?? 1, limit: limit ?? 40 },
    };
  }

  @Post()
  create(@Body() dto: CreateAlbumDto) {
    return this.albumService.create(dto);
  }

  @Post(':id/sync')
  sync(@Param('id') id: string) {
    return this.albumService.sync(id);
  }
}
