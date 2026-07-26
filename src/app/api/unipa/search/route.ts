import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BASE = 'https://offertaformativa.unipa.it/offweb/public/corso/ricercaSemplice.seam';
const UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anno = searchParams.get('anno') ?? new Date().getFullYear().toString();

  try {
    // Step 1: GET the page to collect session cookies
    const getRes = await fetch(BASE, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.7,en;q=0.3',
      },
    });

    // Collect ALL Set-Cookie values
    const setCookies: string[] = [];
    for (const [k, v] of getRes.headers.entries()) {
      if (k.toLowerCase() === 'set-cookie') setCookies.push(v);
    }
    const cookieStr = setCookies.map((c) => c.split(';')[0].trim()).join('; ');

    const getHtml = await getRes.text();
    const $get = cheerio.load(getHtml);
    const viewState = $get('input[name="javax.faces.ViewState"]').first().val()?.toString() ?? 'j_id1';

    // Step 2: POST the search form with all required fields
    const body = new URLSearchParams({
      'frc': 'frc',
      'frc:annoDecorate:anno': anno,
      'frc:tipoCorsoDecorate:idTipoCorso': '',
      'frc:suggestCorso': '',
      'frc:j_id119_selection': '',
      'frc:salva': 'Aggiorna',
      'javax.faces.ViewState': viewState,
    });

    const postRes = await fetch(BASE, {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.7,en;q=0.3',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://offertaformativa.unipa.it',
        'Referer': BASE,
        'Cookie': cookieStr,
      },
      body: body.toString(),
    });

    const html = await postRes.text();
    const $ = cheerio.load(html);

    const results: { name: string; links: { name: string; oid: string }[] }[] = [];

    $('.corso').each((_, elem) => {
      const name = $(elem).children('.denominazione').first().text().trim();
      const links: { name: string; oid: string }[] = [];

      $(elem)
        .find('a[href*="oidCurriculum"]')
        .each((_, link) => {
          const href = $(link).attr('href') ?? '';
          const match = href.match(/oidCurriculum=(\d{4,})/);
          if (match?.[1]) {
            links.push({ name: $(link).text().trim(), oid: match[1] });
          }
        });

      if (name && links.length > 0) {
        results.push({ name, links });
      }
    });

    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=43200' },
    });
  } catch (err) {
    console.error('[UniPa search error]', err);
    return NextResponse.json({ error: 'Errore di connessione a UniPa' }, { status: 500 });
  }
}
