import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'cumbre_admin_session';
const SESSION_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error('SESSION_SECRET no está configurado.');
  return value;
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, encodedHash] = storedHash.split('$');
  if (scheme !== 'scrypt' || !salt || !encodedHash) return false;
  const derived = scryptSync(password, salt, 64).toString('hex');
  return safeEqual(derived, encodedHash);
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export async function startAdminSession(username: string) {
  const payload = Buffer.from(JSON.stringify({ sub: username, exp: Date.now() + SESSION_AGE * 1000 })).toString('base64url');
  const value = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: SESSION_AGE, path: '/' });
}

export async function endAdminSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' });
}

export async function getAdminSession() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string; exp?: number };
    return parsed.sub && parsed.exp && parsed.exp > Date.now() ? parsed.sub : null;
  } catch {
    return null;
  }
}
