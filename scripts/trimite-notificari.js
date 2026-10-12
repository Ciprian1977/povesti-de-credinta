#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// POVEȘTI DE CREDINȚĂ — Trimitere Notificări Push Segmentate (OneSignal REST API)
// ─────────────────────────────────────────────────────────────────────────────
// Trimite memento-uri duhovnicești către segmentele alese de utilizatori, pe baza
// Tag-urilor sincronizate din Panoul de Setări (/setari-notificari):
//   - dimineata    (true)  → Gândul de dimineață + Sfântul Zilei         (~07:30)
//   - pranz        (true)  → Rugăciunea de la prânz                       (~13:00)
//   - seara        (true)  → Rugăciunea de seară (oră personalizată)      (seara_ora)
//   - alerte_post  (true)  → OPRIT PROVIZORIU: alerte posturi/dezlegări (datele de post nu sunt încă validate BOR)
//
// Utilizare:
//   node trimite-notificari.js programeaza [YYYY-MM-DD]   ← rularea zilnică: programează fiecare abonat la ora aleasă
//   node trimite-notificari.js test                        ← trimite ACUM o notificare de test tuturor abonaților
//   node trimite-notificari.js <dimineata|pranz|seara|alerte_post>  ← trimite ACUM un segment
//
// Variabile de mediu necesare (GitHub Secrets):
//   ONESIGNAL_APP_ID, ONESIGNAL_API_KEY (REST API Key)
//   SUPABASE_URL, SUPABASE_SERVICE_KEY (pt. conținutul zilei)
// ═══════════════════════════════════════════════════════════════════════════════

// În GitHub Actions, mesajele apar și ca „annotations” (vizibile în pagina rulării, fără jurnal)
if (process.env.GITHUB_ACTIONS) {
  const fmt = (a) => a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ').replace(/%/g, '%25').replace(/\r?\n/g, '%0A');
  const e0 = console.error.bind(console), l0 = console.log.bind(console);
  console.error = (...a) => { e0(...a); e0('::error::' + fmt(a)); };
  console.log = (...a) => { l0(...a); const t = fmt(a); if (/[✅⚠️❌]/u.test(t)) l0('::notice::' + t); };
}

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const ICON = 'https://www.povestidecredinta.ro/images/icon-192.png';
const BASE = 'https://www.povestidecredinta.ro/';

const LUNI = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie',
              'august','septembrie','octombrie','noiembrie','decembrie'];

// ─── Helper: data de azi în fusul orar România (YYYY-MM-DD) ──────────────────
function dataAziRo() {
  const acum = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
  const an = acum.getFullYear();
  const luna = String(acum.getMonth() + 1).padStart(2, '0');
  const zi = String(acum.getDate()).padStart(2, '0');
  return `${an}-${luna}-${zi}`;
}

function formateazaDataRo(dataISO) {
  const [an, luna, zi] = dataISO.split('-').map(Number);
  return `${zi} ${LUNI[luna - 1]} ${an}`;
}

// ─── Aduce conținutul zilei din Supabase (sfânt + badge post) ────────────────
// ─── Calendarul validat (oct.–dec. 2026, transcris din calendarul tipărit) ─────
// Fișierul este în depozit (data/calendar-validat-2026-t4.json); site-ul îl folosește deja la afișare.
// Pentru zilele din fișier, numele sfinților din notificări vin de aici, nu din Supabase. Baza de date nu se modifică.
const CALE_CALENDAR_VALIDAT = process.env.PDC_CALENDAR_VALIDAT ||
  require('path').join(__dirname, '..', 'data', 'calendar-validat-2026-t4.json');
let _calendarValidat;
function calendarValidat() {
  if (_calendarValidat === undefined) {
    try { _calendarValidat = JSON.parse(require('fs').readFileSync(CALE_CALENDAR_VALIDAT, 'utf8')).zile || {}; }
    catch (e) { _calendarValidat = {}; console.warn('⚠️ Calendarul validat nu a putut fi citit — folosesc numele din Supabase.'); }
  }
  return _calendarValidat;
}
// Numele pentru notificare: sfinții și sărbătoarea zilei (+ numele duminicii), fără semnele de cruce tipărite
function numeNotificare(z) {
  const t = z.sfinti + (z.duminica ? '; ' + z.duminica : '');
  return t.replace(/\(†\)\s*|†\)\s*|†\s*/g, '').replace(/\s{2,}/g, ' ').trim();
}

async function getContinutZiSupabase(dataISO) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/zile_ortodoxe?data_calendaristica=eq.${dataISO}&select=*`;
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    const rows = await r.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch (e) {
    console.warn('⚠️ Nu am putut citi conținutul din Supabase:', e.message);
    return null;
  }
}

async function getContinutZi(dataISO) {
  const continut = await getContinutZiSupabase(dataISO);
  const z = calendarValidat()[dataISO];
  if (!z) return continut;
  console.log(`ℹ️ Numele sfinților pentru ${dataISO} vin din calendarul validat.`);
  return { ...(continut || {}), data_calendaristica: dataISO, sfant_nume: numeNotificare(z) };
}

// ─── MĂSURĂ PROVIZORIE: fără informații despre post în notificări ───────────
// Până la validarea calendarului BOR, notificările NU menționează postul, dezlegările sau harțile,
// iar alertele dedicate postului (segmentul alerte_post) nu se mai programează și nu se mai trimit.
// Pentru revenire: ALERTE_POST_OPRITE = false și se restaurează textele din istoricul git.
const ALERTE_POST_OPRITE = true;
// Cuvintele care țin de post. Granițele sunt litere Unicode (nu \b), ca să meargă și cu diacritice.
//  - NU se potrivesc: „Apostol”, „Postitorul” (nume de sfânt), „Duminica a 2-a din Post” (numele duminicii),
//    „post și neagonisire” (titlul unei pericope; „post” simplu contează doar cu majusculă, ca marcaj: „(Post)”).
//  - SE potrivesc: „Postul/Postului …”, „Post” (marcaj), „Dezlegare …”, „Harți”.
const CUV_POST = '(?<!\\p{L})(?:(?<!din\\s+)(?:[Pp]ost(?:ul|ului|uri|urile|urilor)|Post)|[Dd]ezleg\\p{L}*|[Hh]ar[țţt]i)(?!\\p{L})';
const RX_POST = new RegExp(CUV_POST, 'u');
// Restul mențiunii: până la următorul ; , . sau paranteză. Punctul din abrevieri („Sf. Ap.”) nu oprește fraza,
// iar lista de alimente a unei dezlegări („brânză, lapte, ouă şi peşte”) face parte din mențiune.
const COADA = '(?:[^;,.()]|\\.(?<=(?<!\\p{L})(?:Sf|Ap|Mc|Cuv|Ier|Mari|Prooroc|Proroc|Sfinţit|Sfințit)\\.)|,(?=\\s*(?:lapte|ouă|ouă|brânză|pește|peşte|vin|untdelemn|ulei|icre)(?!\\p{L})))*';
// Plus cuvintele de dinainte care fără mențiune nu au sens („Începutul”, „Lăsatul secului pentru”, „zi de”).
const RX_FRAZA_POST = new RegExp(
  '(?:(?<!\\p{L})(?:[ÎI]nceputul|[îi]nceputul|Sfârșitul|Sfârşitul|sfârșitul|Lăsatul\\s+sec\\p{L}*(?:\\s+de\\s+\\p{L}+)?\\s+pentru|[Zz]i(?:le)?\\s+de)\\s+)?' +
  CUV_POST + COADA, 'gu');
// Scoate DOAR mențiunile despre post/dezlegări/harți; păstrează numele sfinților și ale sărbătorilor.
//   „Sf. Cuv. Parascheva (Dezlegare la pește)”            → „Sf. Cuv. Parascheva”
//   „Nașterea Domnului (Crăciunul. Harți)”                → „Nașterea Domnului (Crăciunul)”
//   „Începutul Postului Nașterii Domnului; Sf. Mc. Gurie” → „Sf. Mc. Gurie”
function faraPost(text) {
  const original = String(text || '').trim();
  let t = original.replace(RX_FRAZA_POST, '');
  if (t === original) return original; // fără mențiuni de post: textul rămâne exact cum era
  for (let k = 0; k < 3; k++) {
    t = t
      .replace(/\(\s*[.;,:\s]*\)/g, '')          // paranteze rămase goale
      .replace(/\(\s*[.;,:]+\s+/g, '(')            // „( . Tedeum” → „(Tedeum”
      .replace(/\s*[.;,:]+\s+\)/g, ')')            // „Tedeum. )” → „Tedeum)”
      .replace(/\s*([;,])(?:\s*[;,.])+/g, '$1')     // separatori dublați
      .replace(/\.(?:\s*\.)+/g, '.')
      .replace(/\s+([;,.)])/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s;,.:–-]+|[\s;,:–-]+$/g, '');
  }
  return t.trim();
}
// Aplică faraPost pe toate textele unei notificări (titlu, subtitlu, mesaj, date suplimentare)
function curataPayload(payload) {
  for (const camp of ['headings', 'subtitle', 'contents', 'data']) {
    const o = payload[camp];
    if (o && typeof o === 'object') for (const k of Object.keys(o)) if (typeof o[k] === 'string') o[k] = faraPost(o[k]);
  }
  return payload;
}
// Ultima plasă de siguranță înainte de trimitere: niciun câmp text nu are voie să menționeze postul
function contineInfoPost(payload) {
  const t = [payload.headings, payload.contents, payload.subtitle, payload.data]
    .map((x) => (x && typeof x === 'object') ? Object.values(x).join(' ') : (x || '')).join(' ') + ' ' + (payload.web_url || '');
  return RX_POST.test(t) || /\/posturi\b/.test(t);
}

// ─── Etichetă lizibilă pentru badge-ul de post (nefolosită cât timp măsura provizorie e activă) ───
function etichetaPost(tipPost) {
  switch (tipPost) {
    case 'dezlegare_peste': return '🐟 Dezlegare la pește';
    case 'dezlegare_ulei':  return '🍷 Dezlegare la vin și untdelemn';
    case 'post_aspru':      return '🕯️ Post aspru (fără ulei)';
    case 'dezlegare':       return '🍽️ Dezlegare la toate';
    case 'post_negru':      return '✝️ Post negru';
    default:                return '';
  }
}

// ─── Construiește payload-ul pentru fiecare segment ──────────────────────────
// Folosește FILTRE pe Tags (field=tag) pentru a viza doar abonații care au
// activat segmentul respectiv. Cheile sunt cele OFICIALE OneSignal REST API.
function construistePayload(segment, dataISO, continut, oraActuala) {
  const dataRo = formateazaDataRo(dataISO);
  const sfant = faraPost((continut && continut.sfant_nume) ? continut.sfant_nume : 'Sfinții zilei') || 'Sfinții zilei';
  const badge = ''; // măsură provizorie: fără etichetă de post (vezi ALERTE_POST_OPRITE)

  // Bază comună
  const baza = {
    app_id: ONESIGNAL_APP_ID,
    chrome_web_icon: ICON,
    chrome_web_badge: ICON,
    // android/ios fallback
    large_icon: ICON
  };

  switch (segment) {
    case 'dimineata':
      return {
        ...baza,
        // toți abonații, cu excepția celor care au oprit explicit notificarea de dimineață
        filters: [{ field: 'tag', key: 'dimineata', relation: 'not_exists' }, { operator: 'OR' }, { field: 'tag', key: 'dimineata', relation: '=', value: 'true' }, { operator: 'OR' }, { field: 'tag', key: 'dimineata', relation: '=', value: '1' }],
        headings: { ro: `☀️ ${sfant}`, en: `☀️ ${sfant}` },
        contents: {
          ro: badge
            ? `Bună dimineața! Astăzi, ${dataRo}. ${badge}. Apasă pentru viața sfântului și calendarul zilei.`
            : `Bună dimineața! Astăzi, ${dataRo}. Apasă pentru viața sfântului și calendarul zilei.`
        },
        web_url: `${BASE}`
      };

    case 'pranz':
      return {
        ...baza,
        filters: [{ field: 'tag', key: 'pranz', relation: '=', value: 'true' }, { operator: 'OR' }, { field: 'tag', key: 'pranz', relation: '=', value: '1' }],
        headings: { ro: '🍽️ Rugăciunea de la prânz' },
        contents: {
          ro: 'O clipă de mulțumire la mijlocul zilei. „Toate către Tine așteaptă, ca să le dai lor hrană la bună vreme." Apasă pentru rugăciunea mesei.'
        },
        web_url: `${BASE}rugaciuni`
      };

    case 'seara':
      return {
        ...baza,
        filters: [{ field: 'tag', key: 'seara', relation: '=', value: 'true' }, { operator: 'OR' }, { field: 'tag', key: 'seara', relation: '=', value: '1' }],
        headings: { ro: '🌙 Rugăciunea de seară' },
        contents: {
          ro: 'Liniștea nopții. Înainte de culcare, încredințează ziua lui Dumnezeu prin rugăciunile din Ceaslov. Apasă pentru rânduiala serii.'
        },
        web_url: `${BASE}rugaciuni`
      };

    case 'alerte_post':
      if (ALERTE_POST_OPRITE) throw new Error('Segmentul alerte_post este oprit provizoriu.');
      return {
        ...baza,
        filters: [{ field: 'tag', key: 'alerte_post', relation: '=', value: 'true' }, { operator: 'OR' }, { field: 'tag', key: 'alerte_post', relation: '=', value: '1' }],
        headings: { ro: badge ? `🕯️ ${badge}` : '🕯️ Calendar ortodox' },
        contents: {
          ro: badge
            ? `Astăzi, ${dataRo}: ${badge}. Apasă pentru rânduiala postului și sfatul duhovnicesc al zilei.`
            : `Astăzi, ${dataRo}. Apasă pentru rânduiala zilei din calendarul ortodox.`
        },
        web_url: `${BASE}posturi`
      };

    default:
      throw new Error(`Segment necunoscut: ${segment}`);
  }
}

// ─── Orele din care poate alege utilizatorul (trebuie să fie identice cu listele din pagina de setări) ─
const ORE = {
  dimineata:   { lista: jumatati(5, 0, 9, 0),   implicit: '07:30' },
  pranz:       { lista: jumatati(11, 30, 14, 30), implicit: '13:00' },
  seara:       { lista: jumatati(19, 0, 23, 0), implicit: '21:30' },
  alerte_post: { lista: jumatati(5, 0, 9, 0),   implicit: '07:30' }
};
function jumatati(h1, m1, h2, m2) {
  const r = []; for (let t = h1 * 60 + m1; t <= h2 * 60 + m2; t += 30) r.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`); return r;
}
function cheieUnica(text) { // UUID determinist (v5-like) din text
  const h = require('crypto').createHash('sha1').update('povestidecredinta|' + text).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
const ACTIV = (seg) => [{ field: 'tag', key: seg, relation: '=', value: 'true' }];

// Filtru OneSignal: abonații cu segmentul pornit ȘI ora aleasă = `ora`.
// Pentru ora implicită intră și cei care nu au ales nicio oră. La dimineață intră și cei fără niciun tag.
function filtrePentruOra(seg, ora) {
  const grupe = [[...ACTIV(seg), { field: 'tag', key: `${seg}_ora`, relation: '=', value: ora }]];
  if (ora === ORE[seg].implicit) {
    grupe.push([...ACTIV(seg), { field: 'tag', key: `${seg}_ora`, relation: 'not_exists' }]);
    if (seg === 'dimineata') grupe.push([{ field: 'tag', key: 'dimineata', relation: 'not_exists' }]);
  }
  const f = [];
  grupe.forEach((g, i) => { if (i) f.push({ operator: 'OR' }); f.push(...g); });
  return f;
}

function offsetRo() { // "+0300" vara, "+0200" iarna
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Bucharest', timeZoneName: 'longOffset' }).formatToParts(new Date());
  const o = (p.find(x => x.type === 'timeZoneName') || {}).value || 'GMT+02:00';
  return o.replace('GMT', '').replace(':', '') || '+0200';
}
function oraAcumRo() {
  const a = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
  return a.getHours() * 60 + a.getMinutes();
}

// OneSignal cere textul și în engleză („Any/English language content”); abonații sunt români, deci folosim același text.
function completeazaEngleza(payload) {
  for (const camp of ['headings', 'contents', 'subtitle']) {
    if (payload[camp] && payload[camp].ro && !payload[camp].en) payload[camp].en = payload[camp].ro;
  }
  return payload;
}

async function postOneSignal(payload) {
  completeazaEngleza(payload);
  if (contineInfoPost(payload)) {
    // nu trimitem informații de post nevalidate: scoatem doar mențiunea, restul notificării rămâne
    curataPayload(payload);
    if (contineInfoPost(payload)) { console.error('❌ Notificare blocată: conține informații despre post.'); return { ok: false, faraAbonati: false, status: 0, j: { errors: ['blocat: informatii de post'] } }; }
  }
  const r = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `Key ${ONESIGNAL_API_KEY}` },
    body: JSON.stringify(payload)
  });
  let j = {}; try { j = await r.json(); } catch (e) {}
  const err = JSON.stringify(j.errors || '');
  const faraAbonati = /not subscribed|no subscribers|no recipients|All included players/i.test(err);
  return { ok: r.ok && !j.errors, faraAbonati, status: r.status, j };
}

function verificaChei() {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.error('❌ Lipsesc secretele ONESIGNAL_APP_ID / ONESIGNAL_API_KEY în GitHub → Settings → Secrets → Actions. Nu se trimite nimic.');
    process.exit(1);
  }
}

// ─── Programează toate notificările zilei, fiecare la ora aleasă de abonat ───
async function programeazaZiua(dataISO) {
  verificaChei();
  const continut = await getContinutZi(dataISO);
  const off = offsetRo(), acum = oraAcumRo();
  let ok = 0, goale = 0, erori = 0;
  for (const seg of Object.keys(ORE)) {
    if (seg === 'alerte_post' && ALERTE_POST_OPRITE) {
      console.log('ℹ️ [alerte_post] oprit provizoriu până la validarea calendarului BOR — nu programez alerte de post.');
      continue;
    }
    if (seg === 'alerte_post' && !(continut && /post/.test(continut.tip_post || ''))) {
      console.log('ℹ️ [alerte_post] azi nu e zi de post — nu programez alerte.');
      continue;
    }
    for (const ora of ORE[seg].lista) {
      const [h, m] = ora.split(':').map(Number);
      if (h * 60 + m <= acum + 2) continue; // ora a trecut deja azi
      const p = construistePayload(seg, dataISO, continut, ora);
      p.filters = filtrePentruOra(seg, ora);
      p.send_after = `${dataISO} ${ora}:00 GMT${off}`;
      p.idempotency_key = cheieUnica(`${dataISO}|${seg}|${ora}`); // aceeași zi+segment+oră = o singură notificare, chiar dacă rulăm de 2 ori
      const r = await postOneSignal(p);
      if (r.ok) { ok++; console.log(`✅ [${seg} ${ora}] programată (id=${r.j.id})`); }
      else if (r.faraAbonati) { goale++; }
      else { erori++; console.error(`❌ [${seg} ${ora}] HTTP ${r.status}:`, JSON.stringify(r.j)); }
    }
  }
  console.log(`\n📅 ${dataISO}: ${ok} programate, ${goale} fără abonați, ${erori} erori (ora RO offset ${off}).`);
  if (erori) process.exit(1);
}

// ─── Trimite ACUM (test sau un segment anume) ───────────────────────────────
async function trimite(segment, dataISO, oraActuala) {
  verificaChei();
  const continut = await getContinutZi(dataISO);
  let payload;
  if (segment === 'test') {
    payload = construistePayload('dimineata', dataISO, continut, oraActuala);
    payload.filters = undefined;
    payload.included_segments = ['Subscribed Users'];
    payload.headings = { ro: '🔔 Test — Povești de Credință', en: '🔔 Test — Povești de Credință' };
    payload.contents = { ro: `Notificările funcționează! Azi: ${faraPost(continut && continut.sfant_nume) || 'Sfinții zilei'}.`, en: 'Notifications work!' };
  } else {
    payload = construistePayload(segment, dataISO, continut, oraActuala);
  }
  let r = await postOneSignal(payload);
  // Segmentul implicit are nume diferite în conturile OneSignal (vechi: „Subscribed Users”, noi: „Total Subscriptions”)
  if (segment === 'test' && !r.ok && r.faraAbonati) {
    for (const alt of ['Total Subscriptions', 'Active Subscriptions']) {
      payload.included_segments = [alt];
      r = await postOneSignal(payload);
      if (r.ok || !r.faraAbonati) break;
    }
  }
  if (r.ok) console.log(`✅ [${segment}] Trimisă acum (id=${r.j.id}, destinatari≈${r.j.recipients ?? '?'})`);
  else if (r.faraAbonati) { console.error(`⚠️ [${segment}] Niciun abonat nu se potrivește. Abonează-te întâi din sit (clopoțelul). Răspuns OneSignal: ${JSON.stringify(r.j)}`); process.exit(1); }
  else { console.error(`❌ [${segment}] OneSignal a refuzat (HTTP ${r.status}):`, JSON.stringify(r.j)); process.exit(1); }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const segment = process.argv[2];
  const dataISO = process.argv[3] || dataAziRo();
  const VALIDE = ['programeaza', 'test', 'dimineata', 'pranz', 'seara', 'alerte_post'];
  if (!VALIDE.includes(segment)) {
    console.error(`❌ Folosire: node trimite-notificari.js <${VALIDE.join('|')}> [YYYY-MM-DD]`);
    process.exit(1);
  }
  if (segment === 'programeaza') return programeazaZiua(dataISO);
  if (segment === 'alerte_post' && ALERTE_POST_OPRITE) {
    console.log('ℹ️ [alerte_post] oprit provizoriu până la validarea calendarului BOR — nu se trimite nimic.');
    return;
  }
  console.log(`📤 Trimit ACUM segment="${segment}" pentru data=${dataISO} ...`);
  await trimite(segment, dataISO);
}

main().catch(err => {
  console.error('❌ Eroare la trimiterea notificării:', err);
  process.exit(1);
});
