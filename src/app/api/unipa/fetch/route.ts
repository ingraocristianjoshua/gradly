import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://offertaformativa.unipa.it/offweb/public/corso/visualizzaCurriculum.seam';

// Subjects whose evaluation type maps to a human label
const TIPO_LABEL: Record<string, string> = {
  V: 'voto',   // graded 18-30L
  I: 'idoneo', // pass/fail
  '': 'altro',
};

function toTitleCase(s: string) {
  return s
    .replace(/([^\W_]+[^\s-\.]*) */g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    )
    .replace(/\bIi\b/g, 'II')
    .replace(/\bIii\b/g, 'III')
    .replace(/\bIv\b/g, 'IV')
    .replace(/\bDi\b/g, 'di')
    .replace(/\bDel\b/g, 'del')
    .replace(/\bDella\b/g, 'della')
    .replace(/\bE\b/g, 'e')
    .replace(/\bIn\b/g, 'in')
    .replace(/\bCon\b/g, 'con')
    .replace(/\bPer\b/g, 'per');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const oid = searchParams.get('oid');
  if (!oid) return NextResponse.json({ error: 'OID mancante' }, { status: 400 });

  try {
    const url = `${BASE_URL}?oidCurriculum=${oid}`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'it', 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const lectures: { name: string; cfu: number; tipo: string; gradeable: boolean }[] = [];

    $('tr.odd, tr.even').each((_, row) => {
      const nameTd = $(row).children('.curriculum-insegnamento').first();
      const cfuTd  = $(row).children('.curriculum-cfu').first();
      const valTd  = $(row).children('.curriculum-valutazione').first();

      // Walk to innermost element for name
      let el = nameTd;
      while (el.children().length > 0) el = el.children().first();
      const rawName = el.text().trim().replace(/^\d+ - /, '');
      if (!rawName) return;

      const name = toTitleCase(rawName);
      const cfu  = parseInt(cfuTd.text().trim()) || 0;
      const tipo = valTd.text().trim().toUpperCase();
      // Include all subject types: V (graded), I (idoneo), empty (tirocinio/tesi etc.)
      const gradeable = tipo === 'V';

      lectures.push({ name, cfu, tipo: TIPO_LABEL[tipo] ?? 'altro', gradeable });
    });

    const degreeName = $('h3.capolettera').first().text().trim();

    return NextResponse.json({ name: degreeName, lectures }, {
      headers: { 'Cache-Control': `public, s-maxage=${60 * 60 * 24 * 2}` },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Errore nel recupero del piano di studi' }, { status: 500 });
  }
}
