import crypto from 'crypto';

/**
 * Escapes unsafe HTML characters to prevent XSS attacks.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes plain text by removing control characters and HTML tags.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  return String(input)
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // Strip ASCII control characters
    .trim();
}

/**
 * Validates that a URL strictly uses standard HTTP/HTTPS schemes.
 * Prevents javascript:, data:, file:, and other unsafe pseudoprotocols.
 */
export function isValidHttpUrl(urlString: string | null | undefined): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL, returning empty string if not a safe HTTP/HTTPS URL.
 */
export function sanitizeUrl(urlString: string | null | undefined): string {
  if (!urlString) return '';
  const trimmed = urlString.trim();
  if (isValidHttpUrl(trimmed)) {
    return trimmed;
  }
  return '';
}

/**
 * Validates email format using RFC 5322 compatible regex.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return re.test(email.trim());
}

/**
 * Compares two strings in constant time to prevent timing side-channel attacks.
 */
export function timingSafeStringEqual(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep timing uniform
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
