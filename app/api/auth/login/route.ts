import { NextResponse } from 'next/server';
import { startAdminSession, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    const username = body.username?.trim() || '';
    const password = body.password || '';
    const configuredUser = process.env.ADMIN_USER;
    const configuredHash = process.env.ADMIN_PASSWORD_HASH;
    if (!configuredUser || !configuredHash) return NextResponse.json({ error: 'El acceso admin todavía no está configurado.' }, { status: 503 });
    if (username !== configuredUser || !verifyPassword(password, configuredHash)) return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    await startAdminSession(username);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo iniciar sesión.' }, { status: 400 });
  }
}
