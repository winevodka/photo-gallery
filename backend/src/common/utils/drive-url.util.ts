/**
 * Extracts a Google Drive folder ID from a folder URL or returns the input
 * unchanged if it already looks like a bare folder ID.
 *
 * Supports URLs like:
 *   https://drive.google.com/drive/folders/<id>
 *   https://drive.google.com/drive/u/0/folders/<id>?usp=sharing
 */
export function extractDriveFolderId(folderUrlOrId: string): string {
  const match = folderUrlOrId.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return match[1];
  }
  return folderUrlOrId.trim();
}

/**
 * Builds a stable, non-expiring image URL for a Google Drive file, given its
 * file ID. Unlike the `thumbnailLink`/`webContentLink` fields returned by the
 * Drive API (which are short-lived, typically valid for under an hour), this
 * endpoint keeps working indefinitely as long as the file stays shared as
 * "Anyone with the link".
 *
 * `size` controls the longest edge in pixels of the returned image.
 */
export function buildDriveThumbnailUrl(
  driveFileId: string,
  size = 1000,
): string {
  return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w${size}`;
}
