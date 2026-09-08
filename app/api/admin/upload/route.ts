import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { uploadImageToGithub } from '@/lib/github';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !allowedTypes.has(file.type)) return NextResponse.json({ error: 'Usa una imagen JPG, PNG, WEBP o AVIF.' }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'La imagen no puede superar 2 MB.' }, { status: 400 });
    return NextResponse.json({ ok: true, url: await uploadImageToGithub(file) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo subir la imagen.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
