/**
 * surse-doxologia.js — Apostolul și Evanghelia zilei din calendarul ortodox oficial BOR
 * publicat de Mitropolia Moldovei și Bucovinei pe doxologia.ro.
 *
 *   const { lecturiZi } = require('./surse-doxologia');
 *   const l = await lecturiZi('2026-10-11');
 *   // { apostol_carte:'Galateni', apostol_versete:'2, 16-20', apostol_text:'Fraților, ...',
 *   //   evanghelie_carte:'Luca', evanghelie_versete:'8, 5-15', evanghelie_text:'Zis-a Domnul ...',
 *   //   sarbatoare:'Duminica a 21-a după Rusalii (...)', sfinti:['Sfântul Apostol Filip, ...', ...],
 *   //   sursa:'https://doxologia.ro/11-octombrie' }
 *
 * Întoarce null dacă sursa nu răspunde (generatorul folosește atunci varianta veche).
 */
const BAZA = 'https://doxologia.ro';
const LUNI = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
const cacheLuna = new Map();
const cacheText = new Map();

async function ia(url, incercari = 3) {
  for (let i = 1; i <= incercari; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; povestidecredinta.ro calendar)' } });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch (e) { /* reîncercăm */ }
    await new Promise((res) => setTimeout(res, 1500 * i));
  }
  return null;
}

function decodeaza(s) {
  return s
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}
const faraTaguri = (s) => decodeaza(s.replace(/<[^>]+>/g, '')).replace(/[ \t ]+/g, ' ').trim();

/** „Ap. I Corinteni 15, 58; 16, 1-3” → { carte:'I Corinteni', versete:'15, 58; 16, 1-3' } */
function desparteReferinta(ref) {
  const r = ref.replace(/^(Ap|Ev)\.\s*/i, '').trim();
  const m = r.match(/^(.+?)\s+(\d.*)$/);
  return m ? { carte: m[1].trim(), versete: m[2].trim() } : { carte: r, versete: '' };
}

/** Textul integral al unei pericope (pagina ei de pe doxologia.ro). */
async function textPericopa(href) {
  const url = href.startsWith('http') ? href : BAZA + href;
  if (cacheText.has(url)) return cacheText.get(url);
  const html = await ia(url);
  let text = null;
  if (html) {
    const i = html.indexOf('field--name-body');
    if (i >= 0) {
      const bucata = html.slice(i, i + 60000);
      const sf = bucata.indexOf('socializare-title');
      const corp = sf > 0 ? bucata.slice(0, sf) : bucata;
      const paragrafe = [...corp.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => faraTaguri(m[1])).filter(Boolean);
      text = paragrafe.join('\n\n') || null;
    }
  }
  cacheText.set(url, text);
  return text;
}

async function paginaLuna(an, luna) {
  const cheie = `${an}${String(luna).padStart(2, '0')}`;
  if (!cacheLuna.has(cheie)) cacheLuna.set(cheie, await ia(`${BAZA}/calendar-ortodox/${cheie}`));
  return cacheLuna.get(cheie);
}

/** Lecturile (referințe + texte) și sfinții unei zile. */
async function lecturiZi(dataISO, { cuText = true } = {}) {
  const [an, luna, zi] = dataISO.split('-').map(Number);
  const html = await paginaLuna(an, luna);
  if (!html) return null;
  const marcaj = `href="/${zi}-${LUNI[luna - 1]}" class="a-initday"`;
  const start = html.indexOf(marcaj);
  if (start < 0) return null;
  const urm = html.indexOf('class="a-initday"', start + marcaj.length);
  const bloc = html.slice(start, urm > 0 ? urm : start + 20000);

  const linkuri = [...bloc.matchAll(/<a href="([^"]+)"[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((m) => ({ href: m[1], cls: m[2], text: faraTaguri(m[3]) }));
  const lecturi = linkuri.filter((l) => l.cls.includes('ev-zi'));
  const ap = lecturi.find((l) => /^Ap\./i.test(l.text));
  const ev = lecturi.find((l) => /^Ev\./i.test(l.text));
  const sarbatoare = linkuri.filter((l) => /rosub|negrub/.test(l.cls)).map((l) => l.text.replace(/^[✝†+)\s(]+/, '')).join('; ');
  const sfinti = linkuri.filter((l) => !l.cls.includes('ev-zi') && !l.cls.includes('a-initday') && !/rosub|negrub/.test(l.cls) && l.text).map((l) => l.text);

  const rez = { sarbatoare, sfinti, sursa: `${BAZA}/${zi}-${LUNI[luna - 1]}` };
  if (ap) Object.assign(rez, { apostol_carte: desparteReferinta(ap.text).carte, apostol_versete: desparteReferinta(ap.text).versete, apostol_link: BAZA + ap.href });
  if (ev) Object.assign(rez, { evanghelie_carte: desparteReferinta(ev.text).carte, evanghelie_versete: desparteReferinta(ev.text).versete, evanghelie_link: BAZA + ev.href });
  if (cuText) {
    if (ap) rez.apostol_text = await textPericopa(ap.href);
    if (ev) rez.evanghelie_text = await textPericopa(ev.href);
  }
  return rez;
}

module.exports = { lecturiZi, desparteReferinta, _intern: { faraTaguri, paginaLuna, textPericopa, cacheLuna, cacheText } };
