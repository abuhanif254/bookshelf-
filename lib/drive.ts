/**
 * Google Drive URL Parser & Direct Download Stream Generator
 * 
 * Supports all standard Google Drive sharing formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - Raw FILE_ID strings
 */

export function extractDriveId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already a clean ID (typically 28 to 44 alphanumeric characters + dashes/underscores)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }

  // /file/d/FILE_ID pattern
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // id=FILE_ID pattern
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // /d/FILE_ID pattern
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  return null;
}

export function getDirectDownloadUrl(driveUrlOrId: string): string {
  if (!driveUrlOrId) return '#';
  const fileId = extractDriveId(driveUrlOrId);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  // If it's another direct URL (e.g. Cloudflare R2, Dropbox direct, CDN), return as-is
  return driveUrlOrId.trim();
}

export function getDrivePreviewUrl(driveUrlOrId: string): string {
  const fileId = extractDriveId(driveUrlOrId);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return driveUrlOrId.trim();
}
