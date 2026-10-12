// Predica și sinaxarul generate zilnic: se scot doar propozițiile cu sfinți din afara calendarului validat, cu post/dezlegări,
// culoare liturgică sau citate neverificate; dacă rămâne prea puțin, textul nu se afișează.
// Date reale: textele generate pentru 1–12 oct. 2026 (tests/date/texte-generate-oct-2026.json). Folosire: node tests/test_texte_curatate.js
const fs = require('fs');
const src = fs.readFileSync('js/corectura-provizorie.js', 'utf8');
const g = new Function(src.slice(src.indexOf('  var TITLURI'), src.indexOf('  var NEUTRU')) + '; return {pomeniriStraine, numesteStrain, textFaraStraini, POST, CITAT};')();
const V = JSON.parse(fs.readFileSync('data/calendar-validat-2026-t4.json', 'utf8')).zile;
const zile = JSON.parse(fs.readFileSync('tests/date/texte-generate-oct-2026.json', 'utf8'));
let n = 0, probleme = 0; const P = (m) => { probleme++; console.log('PROBLEMĂ', m); };
const INTERZIS = /Optina|Zenaida|Filonila|Kokkinos|Kaluga|Georgi|Pskov|Zografu|dezlegare|culoare(a)? (liturgic|alb|verde|roș)|„[^”]{25,}”/i;
const ASCUNS = { sinaxar: ['2026-10-02', '2026-10-10', '2026-10-11'], predica: [] };
function aplica(r, k) {
  const st = g.pomeniriStraine(r.sfant_nume, V[r.data_calendaristica]), t = r[k] || '';
  const atins = (st.length && g.numesteStrain(t, st, k === 'predica')) || g.POST.test(t) || g.CITAT.test(t);
  return atins ? g.textFaraStraini(t, st, k) : t;
}
for (const r of zile) for (const k of ['predica', 'sinaxar']) {
  if (!V[r.data_calendaristica] || !r[k]) continue; n++;
  const rez = aplica(r, k), trebuieAscuns = ASCUNS[k].includes(r.data_calendaristica);
  if (!rez !== trebuieAscuns) P(`${r.data_calendaristica} ${k}: ${rez ? 'afișat' : 'ascuns'}, așteptat ${trebuieAscuns ? 'ascuns' : 'afișat'}`);
  if (rez && INTERZIS.test(rez)) P(`${r.data_calendaristica} ${k}: a rămas „${rez.match(INTERZIS)[0]}”`);
}
// 12 oct. (azi): sinaxarul rămâne cu Tarah, Prov, Andronic și Cosma, fără Kaluga și fără „dezlegare la toate”
const r12 = zile.find((r) => r.data_calendaristica === '2026-10-12'), s12 = aplica(r12, 'sinaxar'); n++;
if (!s12 || !/Tarah/.test(s12) || !/Cosma, Episcopul Maiumei/.test(s12) || !/originar din Bitinia/.test(s12) || /Kaluga|dezlegare/.test(s12)) P('12 oct.: sinaxar curățat greșit');
// 11 oct.: predica începe și se termină la fel, fără Sf. Lev de la Optina
const r11 = zile.find((r) => r.data_calendaristica === '2026-10-11'), p11 = aplica(r11, 'predica'); n++;
if (!p11 || !p11.startsWith('Evanghelia zilei, după Luca 8, 5-15') || !/mântuirea sufletelor noastre\.$/.test(p11) || /Lev de la/.test(p11)) P('11 oct.: predica curățată greșit');
// „rugăciune, post și fapte bune” e îndemn general, nu informație de post -> rămâne
n++; if (g.POST.test('Să ducem o viață de rugăciune, post și fapte bune.')) P('îndemnul general la post a fost scos');
// predică în mare parte despre un sfânt străin -> ascunsă
const st11 = g.pomeniriStraine(r11.sfant_nume, V['2026-10-11']); n++;
if (g.textFaraStraini('Sfântul Lev de la Optina a fost stareț. El a trăit în rugăciune. Sfântul Lev de la Optina a povățuit mulți ucenici. Viața lui ne învață smerenia. Să urmăm pe Sfântul Lev de la Optina.', st11, 'predica') !== null) P('predica despre un sfânt străin nu a fost ascunsă');
console.log(`verificări: ${n} | probleme: ${probleme}`); process.exit(probleme ? 1 : 0);
