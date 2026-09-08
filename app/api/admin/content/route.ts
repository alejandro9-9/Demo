import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sanitizeContent } from '@/lib/content';
import { saveContentToGithub } from '@/lib/github';

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  return NextResponse.json({ message: 'La edición se realiza sobre data/content.json del repositorio.' });
}

export async function PUT(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  try {
    const content = sanitizeContent(await request.json());
    const result = await saveContentToGithub(content);
    return NextResponse.json({ ok: true, message: result.local ? 'Cambios guardados en localhost.' : 'Cambios guardados. Vercel publicará la nueva versión.', commitUrl: result.commit?.html_url || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar el contenido.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
