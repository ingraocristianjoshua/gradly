const cheerio = require('cheerio');

async function testPoliMi() {
  const url = 'https://www4.ceda.polimi.it/manifesti/manifesti/controller/ManifestiPublic.do';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const links = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('ManifestiPublic.do')) {
      links.push({ text: $(el).text().trim(), href });
    }
  });

  console.log('Links found:', links.slice(0, 10));
}

testPoliMi().catch(console.error);
