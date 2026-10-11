// Verifică extragerea pericopelor din Biblia 1914 (fără browser), cu codul real din js/corectura-provizorie.js:
// 1) toate referințele reale din baza de date și din calendarul validat se recunosc și dau text;
// 2) cazuri speciale (peste capitol, liste, numerotarea 1914, cărți cu cifre romane);
// 3) textul extras e exact cel din fișierele data/biblia-1914.
// Folosire: node tests/test_lecturi_1914.js
const fs = require('fs');
const src = fs.readFileSync('js/corectura-provizorie.js', 'utf8');
const bucata = src.slice(src.indexOf('  function fd('), src.indexOf('\n', src.indexOf('  function fd(')))
  + src.slice(src.indexOf('  var BIBLIA_V'), src.indexOf('  function cutie('));
const fetch = (u) => { const f = u.split('?')[0].replace(/^\//, ''); return Promise.resolve({ ok: fs.existsSync(f), status: 404, json: () => JSON.parse(fs.readFileSync(f, 'utf8')) }); };
const g = new Function('fetch', 'isoRo', 'localStorage', bucata + '; return {fisierCarte, versete, textPericopa};')(fetch, () => '2026-10-11', { getItem: () => null });
let n = 0, probleme = 0;
const P = (m) => { probleme++; console.log('PROBLEMĂ', m); };
const text = (h) => h.replace(/<sup>(\d+)<\/sup> /g, '[$1] ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  // 2) cazuri speciale
  const cazuri = [
    ['Luca', '8, 5-15', /^\[5\] Ieșit-a semănătorul.*\[15\] Iar cea de pre pământ bun.*roadă întru răbdare\.$/],
    ['Galateni', '2, 16-20', /^\[16\] Știind că nu se îndreptează.*\[20\] Cu Hristos împreună m-am răstignit/],
    ['Matei', '10, 32-33; 37-38; 19, 27-30', /^\[32\] .*\[33\] .*\[37\] .*\[38\] .*\[27\] .*\[30\] /],
    ['Matei', '8:28-9:1', /^\[28\] .*\[34\] .*\[1\] /],
    ['Matei', '8, 28-9, 1', /^\[28\] .*\[34\] .*\[1\] /],
    ['Ioan', '15:17-27; 16:1-2', /^\[17\] .*\[27\] .*\[1\] .*\[2\] /],
    ['I Corinteni', '15, 58; 16, 1-3', /^\[58\] .*\[1\] .*\[3\] /],
    ['II Timotei', '3, 10-15', /^\[10\] .*\[15\] /],
    ['Faptele Apostolilor', '3, 19-26', /^\[19\] .*vremi de răsuflare.*\[20\] .*\[26\] /],
    ['Matei', '1, 23-25', /^\[22\] .*Iată fecioara.*\[24\] .*\[25\] /],          // v. 23 e cuprins în 22 în ediția 1914
    ['Matei', '22, 35-46', /^\[35\] .*\[37\] .*mare poruncă\. \[39\] .*\[46\] /],
    ['2 Corinteni', '7, 1-10', /^\[1\] .*\[10\] /],
    ['Evrei', '11, 33-40; 12, 1-2', /^\[33\] .*\[40\] .*\[1\] .*\[2\] /],
    ['Filipeni', '4, 4-9', /^\[4\] .*\[9\] /],
    ['Coloseni', '3, 4-11', /^\[4\] .*\[11\] /],
    ['I Tesaloniceni', '4, 13-17', /^\[13\] .*\[17\] /],
    ['Iacob', '5, 10-20', /^\[10\] .*\[20\] /],
    ['Romani', '5:1-10', /^\[1\] .*\[10\] /],
    ['Matei', 'IX, 1-8', /^\[1\] .*\[8\] /],                       // capitol cu cifre romane (format real din baza de date)
    ['Ioan', 'Ioan 6:35-39', /^\[35\] .*\[39\] /],                  // cartea repetată în câmpul versetelor
    ['Matei 5, 20-26', '', /^\[20\] .*\[26\] /],                     // totul într-un singur câmp
    ['Fapte', '6, 8-15; 7, 1-5, 47-60', /^\[8\] .*\[15\] .*\[1\] .*\[5\] \S.*\[47\] .*\[60\] /],
  ];
  for (const [c, r, re] of cazuri) {
    n++;
    try { const t = text(await g.textPericopa(c, r)); if (!re.test(t)) P(`${c} ${r}: ${t.slice(0, 160)}`); }
    catch (e) { P(`${c} ${r}: ${e.message}`); }
  }
  for (const [c, r] of [['Vezi Mineiul zilei', ''], ['Luca', 'Vezi Mineiul'], ['Isaia', '1, 1-3']]) {
    n++; try { await g.textPericopa(c, r); P(`ar fi trebuit respins: ${c} ${r}`); } catch (e) { /* corect: respins */ }
  }
  // 1) referințe reale
  const fisier = process.argv[2] || 'tests/date/referinte-lecturi-db.json';  // referințele reale din baza de date (mai–oct. 2026)
  if (fisier && fs.existsSync(fisier)) {
    const refs = JSON.parse(fs.readFileSync(fisier, 'utf8'));
    for (const [c, r] of refs) { n++; try { await g.textPericopa(c, r); } catch (e) { P(`referință reală nerecunoscută: ${c} | ${r} (${e.message})`); } }
  }
  // 3) referințele din calendarul validat (oct.–dec. 2026), unde există
  const V = JSON.parse(fs.readFileSync('data/calendar-validat-2026-t4.json', 'utf8')).zile;
  for (const [zi, z] of Object.entries(V)) {
    for (const m of String(z.lecturi || '').matchAll(/(?:Ap\.|Ev\.|:)\s*((?:[123I]{1,3} )?[A-ZĂÎȘȚ][a-zăâîșț]+(?: Apostolilor)?) (\d[\d,;:\s-]*\d)/g)) {
      n++; try { await g.textPericopa(m[1], m[2]); } catch (e) { P(`${zi} ${m[1]} ${m[2]}: ${e.message}`); }
    }
  }
  console.log(`verificări: ${n} | probleme: ${probleme}`); process.exit(probleme ? 1 : 0);
})();
