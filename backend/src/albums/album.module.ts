import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { Image } from '../images/image.entity';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { ImageModule } from '../images/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Album, Image]),
    GoogleDriveModule,
    ImageModule,
  ],
  providers: [AlbumService],
  controllers: [AlbumController],
})
export class AlbumModule {}
