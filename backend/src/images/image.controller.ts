import { Controller, Get, Param } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }
}
