import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumModule } from './albums/album.module';
import { ImageModule } from './images/image.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { Album } from './albums/album.entity';
import { Image } from './images/image.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
      entities: [Album, Image],
      synchronize: true, // MVP only: auto-sync schema. Replace with migrations for production.
      autoLoadEntities: true,
    }),
    AlbumModule,
    ImageModule,
    GoogleDriveModule,
  ],
})
export class AppModule {}
