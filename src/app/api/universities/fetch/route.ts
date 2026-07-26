import { NextResponse } from 'next/server';
import { getUniversity } from '@/lib/universities';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uniId = searchParams.get('uniId');
  const oid = searchParams.get('oid');
  const anno = searchParams.get('anno');

  if (!uniId || !oid) {
    return NextResponse.json({ error: 'Mancano parametri necessari' }, { status: 400 });
  }

  const adapter = getUniversity(uniId);
  if (!adapter) {
    return NextResponse.json({ error: 'Università non supportata' }, { status: 404 });
  }

  try {
    const data = await adapter.fetchLectures(oid, anno || undefined);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': `public, s-maxage=${60 * 60 * 24 * 2}` },
    });
  } catch (err) {
    console.error(`[Fetch Error - ${uniId}]`, err);
    return NextResponse.json({ error: `Errore nel recupero del piano di studi da ${adapter.name}` }, { status: 500 });
  }
}
