import * as cheerio from 'cheerio';
import { UniversityAdapter, SearchResult, FetchResult } from './types';

const SEARCH_URL = 'https://offertaformativa.unipa.it/offweb/public/corso/ricercaSemplice.seam';
const FETCH_URL = 'https://offertaformativa.unipa.it/offweb/public/corso/visualizzaCurriculum.seam';
const UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0';

const TIPO_LABEL: Record<string, string> = {
  V: 'voto',
  I: 'idoneo',
  '': 'altro',
};

function toTitleCase(s: string) {
  return s
    .replace(/([^\W_]+[^\s-\.]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
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

export const unipa: UniversityAdapter = {
  id: 'unipa',
  name: 'Università degli Studi di Palermo',
  
  searchCourses: async (anno: string, query?: string): Promise<SearchResult[]> => {
    // Step 1: GET the page to collect session cookies
    const getRes = await fetch(SEARCH_URL, {
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
      'frc:suggestCorso': query || '',
      'frc:j_id119_selection': '',
      'frc:salva': 'Aggiorna',
      'javax.faces.ViewState': viewState,
    });

    const postRes = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.7,en;q=0.3',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://offertaformativa.unipa.it',
        'Referer': SEARCH_URL,
        'Cookie': cookieStr,
      },
      body: body.toString(),
    });

    const html = await postRes.text();
    const $ = cheerio.load(html);

    const results: SearchResult[] = [];

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
    
    // Fallback manual client-side filtering if API ignores suggestCorso
    if (query) {
      const q = query.toLowerCase();
      return results.filter(r => r.name.toLowerCase().includes(q));
    }

    return results;
  },

  fetchLectures: async (oid: string, anno?: string): Promise<FetchResult> => {
    const url = `${FETCH_URL}?oidCurriculum=${oid}`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'it', 'User-Agent': UA },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const lectures: { name: string; cfu: number; tipo: string; gradeable: boolean }[] = [];

    $('tr.odd, tr.even').each((_, row) => {
      const nameTd = $(row).children('.curriculum-insegnamento').first();
      const cfuTd  = $(row).children('.curriculum-cfu').first();
      const valTd  = $(row).children('.curriculum-valutazione').first();

      let el = nameTd;
      while (el.children().length > 0) el = el.children().first();
      const rawName = el.text().trim().replace(/^\d+ - /, '');
      if (!rawName) return;

      const name = toTitleCase(rawName);
      const cfu  = parseInt(cfuTd.text().trim()) || 0;
      const tipo = valTd.text().trim().toUpperCase();
      const gradeable = tipo === 'V';

      lectures.push({ name, cfu, tipo: TIPO_LABEL[tipo] ?? 'altro', gradeable });
    });

    const degreeName = $('h3.capolettera').first().text().trim();
    
    return { name: degreeName, lectures };
  }
};
