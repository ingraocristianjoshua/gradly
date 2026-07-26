import { NextResponse } from 'next/server';
import { getUniversity } from '@/lib/universities';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uniId = searchParams.get('uniId');
  const anno = searchParams.get('anno') ?? new Date().getFullYear().toString();
  const query = searchParams.get('query') ?? '';

  if (!uniId) {
    return NextResponse.json({ error: 'Manca il parametro uniId' }, { status: 400 });
  }

  const adapter = getUniversity(uniId);
  if (!adapter) {
    return NextResponse.json({ error: 'Università non supportata' }, { status: 404 });
  }

  try {
    const results = await adapter.searchCourses(anno, query);
    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=43200' },
    });
  } catch (err) {
    console.error(`[Search Error - ${uniId}]`, err);
    return NextResponse.json({ error: `Errore nella ricerca per ${adapter.name}` }, { status: 500 });
  }
}
