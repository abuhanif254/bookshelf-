import crypto from 'crypto';
import { cookies } from 'next/headers';

export const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'mohammadbitullah@gmail.com').toLowerCase().trim();
const SESSION_SECRET = process.env.SESSION_SECRET || 'bookshelf_master_security_secret_2026_key_99x';
const COOKIE_NAME = 'bookshelf_admin_session';

// Server-side session revocation epoch
let sessionVersion = 1;
let lastRevokedAt = 0;

export function revokeAllSessions() {
  sessionVersion += 1;
  lastRevokedAt = Date.now();
}

interface MagicTokenRecord {
  email: string;
  token: string;
  pin: string;
  expiresAt: number;
  attempts: number;
  ip?: string;
}

// In-memory token store with auto-expiry
const magicTokens = new Map<string, MagicTokenRecord>();
const pinLookup = new Map<string, string>(); // pin -> token

// Clean expired tokens every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [token, record] of magicTokens.entries()) {
      if (record.expiresAt < now) {
        magicTokens.delete(token);
        pinLookup.delete(record.pin);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Generate a 1-click Magic Link Token and 6-Digit PIN for the admin email
 */
export function createMagicLink(email: string, ip?: string): { success: boolean; message?: string; token?: string; pin?: string; expiresAt?: number } {
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return {
      success: false,
      message: 'Unauthorized. This email does not have administrator privileges.',
    };
  }

  // Generate high-entropy 64-char crypto token + 6-digit PIN
  const token = crypto.randomBytes(32).toString('hex');
  const pin = Math.floor(100000 + Math.random() * 900000).toString(); // e.g. "492018"
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  const record: MagicTokenRecord = {
    email: cleanEmail,
    token,
    pin,
    expiresAt,
    attempts: 0,
    ip,
  };

  magicTokens.set(token, record);
  pinLookup.set(pin, token);

  return {
    success: true,
    token,
    pin,
    expiresAt,
  };
}

/**
 * Verify Magic Token (from link) or 6-Digit PIN (from input box)
 * Implements 5-Attempt Lockout & Burn protection against brute-forcing
 */
export function verifyMagicTokenOrPin(identifier: string): { success: boolean; email?: string; sessionToken?: string; message?: string } {
  const clean = identifier.trim();
  let token = clean;

  // If user entered a 6-digit PIN
  if (/^\d{6}$/.test(clean)) {
    const resolved = pinLookup.get(clean);
    if (!resolved) {
      // Find the active token for this user to increment failed attempt counter
      for (const [tok, rec] of magicTokens.entries()) {
        rec.attempts += 1;
        if (rec.attempts >= 5) {
          magicTokens.delete(tok);
          pinLookup.delete(rec.pin);
          return { success: false, message: 'Too many incorrect attempts. For security, this PIN was burned. Please request a new link.' };
        }
        return { success: false, message: `Invalid PIN code. (${5 - rec.attempts} attempts remaining)` };
      }
      return { success: false, message: 'Invalid or expired 6-digit PIN. Please request a new code.' };
    }
    token = resolved;
  }

  const record = magicTokens.get(token);
  if (!record) {
    return { success: false, message: 'Invalid or expired login link. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    magicTokens.delete(token);
    pinLookup.delete(record.pin);
    return { success: false, message: 'This login code has expired (15m limit). Please request a new code.' };
  }

  // One-time use: consume the token immediately
  magicTokens.delete(token);
  pinLookup.delete(record.pin);

  // Generate cryptographically signed 30-day session token
  const sessionToken = createSessionToken(record.email);

  return {
    success: true,
    email: record.email,
    sessionToken,
  };
}

/**
 * Create a signed session token: base64(payload).signature
 */
export function createSessionToken(email: string): string {
  const payload = {
    email: email.toLowerCase(),
    role: 'super_admin',
    ver: sessionVersion,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(str).digest('base64url');
  return `${str}.${signature}`;
}

/**
 * Validate a signed session token with server-side revocation checks
 */
export function verifySessionToken(tokenString: string | undefined | null): { valid: boolean; email?: string } {
  if (!tokenString || typeof tokenString !== 'string') return { valid: false };

  const parts = tokenString.split('.');
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, providedSig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encodedPayload).digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false };
    }
    if (payload.email !== AUTHORIZED_ADMIN_EMAIL) {
      return { valid: false };
    }
    // Check server-side revocation version and timestamp
    if (payload.ver !== sessionVersion) {
      return { valid: false };
    }
    if (lastRevokedAt && payload.iat && payload.iat < lastRevokedAt) {
      return { valid: false };
    }
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Helper to check if incoming request contains valid admin session cookie
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return false;
    const { valid } = verifySessionToken(sessionCookie.value);
    return valid;
  } catch {
    return false;
  }
}

/**
 * Check request headers/cookies directly with CSRF protection for mutating HTTP methods
 */
export function isRequestAuthorized(request: Request): boolean {
  try {
    // CSRF check on mutating methods
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return false; // Cross-origin mutation rejected
          }
        } catch {
          return false;
        }
      }
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match || !match[1]) return false;
    const { valid } = verifySessionToken(match[1]);
    return valid;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
