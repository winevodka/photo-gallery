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
