import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';
const DEFAULT_TTL = 60 * 60 * 24; // 1 day (seconds)

const getSecret = () => process.env.NEXTAUTH_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret';

export function createAdminToken(adminPassword: string, ttlSeconds = DEFAULT_TTL) {
  const secret = getSecret();
  const expiry = Date.now() + ttlSeconds * 1000;
  const payload = `${expiry}|${adminPassword}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${expiry}:${hmac}`;
}

export function verifyAdminToken(token: string | null | undefined) {
  if (!token) return false;
  try {
    const secret = getSecret();
    const parts = String(token).split(':');
    if (parts.length !== 2) return false;
    const expiry = Number(parts[0]);
    const sig = parts[1];
    if (isNaN(expiry)) return false;
    if (Date.now() > expiry) return false;
    // We don't have the original adminPassword here, but we can recompute using the current ADMIN_PASSWORD env var
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const payload = `${expiry}|${adminPassword}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest();
    const actual = Buffer.from(sig, 'hex');
    if (expected.length !== actual.length) {
      // Use a fallback constant-time comparison
      return false;
    }
    return crypto.timingSafeEqual(expected, actual);
  } catch (e) {
    return false;
  }
}

export function getCookieFromHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map(p => p.trim());
  for (const p of parts) {
    if (p.startsWith(COOKIE_NAME + '=')) {
      return p.substring((COOKIE_NAME + '=').length);
    }
  }
  return null;
}

export { COOKIE_NAME };
