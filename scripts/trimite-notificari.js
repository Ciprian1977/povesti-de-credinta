#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// POVEȘTI DE CREDINȚĂ — Trimitere Notificări Push Segmentate (OneSignal REST API)
// ─────────────────────────────────────────────────────────────────────────────
// Trimite memento-uri duhovnicești către segmentele alese de utilizatori, pe baza
// Tag-urilor sincronizate din Panoul de Setări (/setari-notificari):
//   - dimineata    (true)  → Gândul de dimineață + Sfântul Zilei         (~07:30)
//   - pranz        (true)  → Rugăciunea de la prânz                       (~13:00)
//   - seara        (true)  → Rugăciunea de seară (oră personalizată)      (seara_ora)
//   - alerte_post  (true)  → Alerte posturi/sărbători + dezlegări         (ad-hoc)
//
// Utilizare:
//   node trimite-notificari.js <segment> [data YYYY-MM-DD]
//   segment ∈ { dimineata, pranz, seara, alerte_post }
//
// Variabile de mediu necesare (GitHub Secrets):
//   ONESIGNAL_APP_ID, ONESIGNAL_API_KEY (REST API Key)
//   SUPABASE_URL, SUPABASE_SERVICE_KEY (pt. conținutul zilei)
// ═══════════════════════════════════════════════════════════════════════════════

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const ICON = 'https://povestidecredinta.ro/images/icon-192.png';
const BASE = 'https://povestidecredinta.ro';

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
async function getContinutZi(dataISO) {
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

// ─── Etichetă lizibilă pentru badge-ul de post ───────────────────────────────
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
  const sfant = (continut && continut.sfant_nume) ? continut.sfant_nume : 'Sfinții zilei';
  const badge = continut ? etichetaPost(continut.tip_post) : '';

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
        filters: [{ field: 'tag', key: 'dimineata', relation: '=', value: 'true' }],
        headings: { ro: `☀️ ${sfant}`, en: `☀️ ${sfant}` },
        contents: {
          ro: badge
            ? `Bună dimineața! Astăzi, ${dataRo}. ${badge}. Apasă pentru viața sfântului și cuvântul de folos.`
            : `Bună dimineața! Astăzi, ${dataRo}. Apasă pentru viața sfântului și cuvântul de folos al zilei.`
        },
        url: `${BASE}/sfantul-zilei/`,
        web_url: `${BASE}/sfantul-zilei/`
      };

    case 'pranz':
      return {
        ...baza,
        filters: [{ field: 'tag', key: 'pranz', relation: '=', value: 'true' }],
        headings: { ro: '🍽️ Rugăciunea de la prânz' },
        contents: {
          ro: 'O clipă de mulțumire la mijlocul zilei. „Toate către Tine așteaptă, ca să le dai lor hrană la bună vreme." Apasă pentru rugăciunea mesei.'
        },
        url: `${BASE}/rugaciuni.html`,
        web_url: `${BASE}/rugaciuni.html`
      };

    case 'seara':
      return {
        ...baza,
        filters: [{ field: 'tag', key: 'seara', relation: '=', value: 'true' }],
        headings: { ro: '🌙 Rugăciunea de seară' },
        contents: {
          ro: 'Liniștea nopții. Înainte de culcare, încredințează ziua lui Dumnezeu prin rugăciunile din Ceaslov. Apasă pentru rânduiala serii.'
        },
        url: `${BASE}/rugaciuni.html`,
        web_url: `${BASE}/rugaciuni.html`
      };

    case 'alerte_post':
      return {
        ...baza,
        filters: [{ field: 'tag', key: 'alerte_post', relation: '=', value: 'true' }],
        headings: { ro: badge ? `🕯️ ${badge}` : '🕯️ Calendar ortodox' },
        contents: {
          ro: badge
            ? `Astăzi, ${dataRo}: ${badge}. Apasă pentru rânduiala postului și sfatul duhovnicesc al zilei.`
            : `Astăzi, ${dataRo}. Apasă pentru rânduiala zilei din calendarul ortodox.`
        },
        url: `${BASE}/posturi.html`,
        web_url: `${BASE}/posturi.html`
      };

    default:
      throw new Error(`Segment necunoscut: ${segment}`);
  }
}

// ─── Trimite notificarea către OneSignal ─────────────────────────────────────
async function trimite(segment, dataISO, oraActuala) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.log('⚠️ OneSignal nu este configurat (ONESIGNAL_APP_ID / ONESIGNAL_API_KEY lipsesc) – skip.');
    return { skip: true };
  }

  const continut = await getContinutZi(dataISO);
  const payload = construistePayload(segment, dataISO, continut, oraActuala);

  const r = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Key ${ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const rezultat = await r.json();
  if (rezultat.id) {
    console.log(`✅ [${segment}] Notificare trimisă (id=${rezultat.id}, destinatari≈${rezultat.recipients ?? '?'})`);
  } else {
    console.warn(`⚠️ [${segment}] Răspuns OneSignal:`, JSON.stringify(rezultat));
  }
  return rezultat;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const segment = process.argv[2];
  const dataISO = process.argv[3] || dataAziRo();
  const oraActuala = process.argv[4]; // Ora în format HH:MM (opțional, pentru testare)

  const SEGMENTE_VALIDE = ['dimineata', 'pranz', 'seara', 'alerte_post'];
  if (!segment || !SEGMENTE_VALIDE.includes(segment)) {
    console.error(`❌ Segment invalid. Folosire: node trimite-notificari.js <${SEGMENTE_VALIDE.join('|')}> [YYYY-MM-DD] [HH:MM]`);
    process.exit(1);
  }

  // Dacă ora nu este furnizată, o calculez din ora curentă Bucharest
  let ora = oraActuala;
  if (!ora) {
    const acum = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
    const h = String(acum.getHours()).padStart(2, '0');
    const m = String(acum.getMinutes()).padStart(2, '0');
    ora = `${h}:${m}`;
  }

  console.log(`📤 Trimit notificare segment="${segment}" pentru data=${dataISO} la ora=${ora} ...`);
  await trimite(segment, dataISO, ora);
}

main().catch(err => {
  console.error('❌ Eroare la trimiterea notificării:', err);
  process.exit(1);
});
