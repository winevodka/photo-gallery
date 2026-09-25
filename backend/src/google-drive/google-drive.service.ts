import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';

export interface DriveImageFile {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  takenDate: Date | null;
}

const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/bmp',
  'image/tiff',
];

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: drive_v3.Drive | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): drive_v3.Drive {
    if (this.drive) {
      return this.drive;
    }

    // Prefer inline JSON credentials (works on hosts with no persistent
    // filesystem, e.g. Vercel/Railway/Render env vars). Falls back to a
    // key file path for local development.
    const keyJson = this.configService.get<string>(
      'GOOGLE_SERVICE_ACCOUNT_KEY_JSON',
    );
    const keyFilePath = this.configService.get<string>(
      'GOOGLE_SERVICE_ACCOUNT_KEY_PATH',
    );

    const auth = new google.auth.GoogleAuth({
      credentials: keyJson ? JSON.parse(keyJson) : undefined,
      keyFile: keyJson ? undefined : keyFilePath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    this.drive = google.drive({ version: 'v3', auth });
    return this.drive;
  }

  /**
   * Lists all supported image files inside a Google Drive folder.
   * Handles pagination transparently.
   */
  async listImagesInFolder(folderId: string): Promise<DriveImageFile[]> {
    const drive = this.getClient();
    const mimeQuery = SUPPORTED_IMAGE_MIME_TYPES.map(
      (mime) => `mimeType='${mime}'`,
    ).join(' or ');
    const query = `'${folderId}' in parents and (${mimeQuery}) and trashed = false`;

    const files: DriveImageFile[] = [];
    let pageToken: string | undefined;

    do {
      const res = await drive.files.list({
        q: query,
        fields:
          'nextPageToken, files(id, name, thumbnailLink, webContentLink, size, imageMediaMetadata)',
        pageSize: 200,
        pageToken,
      });

      for (const file of res.data.files ?? []) {
        const parsedDate = file.imageMediaMetadata?.time
          ? new Date(file.imageMediaMetadata.time)
          : null;

        files.push({
          id: file.id!,
          name: file.name ?? 'untitled',
          thumbnailUrl: file.thumbnailLink ?? null,
          imageUrl: file.webContentLink ?? null,
          fileSize: file.size ? Number(file.size) : null,
          width: file.imageMediaMetadata?.width ?? null,
          height: file.imageMediaMetadata?.height ?? null,
          takenDate:
            parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null,
        });
      }

      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    this.logger.log(`Fetched ${files.length} image(s) from folder ${folderId}`);
    return files;
  }
}
