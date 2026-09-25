import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  folderUrl: string;

  @IsString()
  @IsOptional()
  coverImage?: string;
}
