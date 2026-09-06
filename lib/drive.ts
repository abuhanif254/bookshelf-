/**
 * URL Parser & Direct Stream / Embed Generator for PDF & eBook Readers
 * 
 * Supports:
 * - Google Drive: View, embed, and direct downloads
 * - Project Gutenberg: Online HTML web-reader and epub downloads
 * - Internet Archive: Online BookReader embed and direct downloads
 * - Direct PDF URLs: Direct links hosted on Cloudflare R2, CDN, or custom storage
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
  return driveUrlOrId.trim();
}

export function getDrivePreviewUrl(driveUrlOrId: string): string {
  const fileId = extractDriveId(driveUrlOrId);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return driveUrlOrId.trim();
}

export function getDriveEmbedUrl(driveUrlOrId: string): string {
  if (!driveUrlOrId) return '';
  const fileId = extractDriveId(driveUrlOrId);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return driveUrlOrId.trim();
}

/**
 * Universal In-Browser Reader Embed URL
 * Supports Google Drive, Internet Archive, Project Gutenberg, and raw PDF streams
 */
export function getReaderEmbedUrl(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();

  // 1. Google Drive
  const driveId = extractDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // 2. Project Gutenberg (e.g. https://www.gutenberg.org/ebooks/2641.epub3.images)
  const gutenbergMatch = trimmed.match(/gutenberg\.org\/ebooks\/(\d+)/i);
  if (gutenbergMatch && gutenbergMatch[1]) {
    return `https://www.gutenberg.org/ebooks/${gutenbergMatch[1]}.html.images`;
  }

  // 3. Internet Archive (e.g. https://archive.org/details/identifier or /download/identifier/...)
  const archiveMatch = trimmed.match(/archive\.org\/(?:details|download)\/([a-zA-Z0-9_\.\-]+)/i);
  if (archiveMatch && archiveMatch[1]) {
    return `https://archive.org/embed/${archiveMatch[1]}`;
  }

  // 4. Direct PDF stream
  if (trimmed.endsWith('.pdf')) {
    return trimmed;
  }

  return '';
}

export function hasReaderStream(urlOrId: string): boolean {
  return Boolean(getReaderEmbedUrl(urlOrId));
}
