// POVEȘTI DE CREDINȚĂ — JavaScript Principal
// ============================================
// Versiunea 4.0 — Arhitectură rute SPA cu history.pushState
// SEO agresiv: meta tags dinamice per rută, JSON-LD Article + FAQPage
// Zero 404: toate rutele servite de /index.html via vercel.json rewrite

// ─── Configurare Supabase ─────────────────────────────────────────────────────
const SUPABASE_URL = 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk';

// ─── Configurare OneSignal (Notificări Push) ─────────────────────────────────
// App ID-ul public OneSignal (din Settings → Keys & IDs).
//    Cheia REST API (secretă) NU se pune aici — doar în GitHub Secrets.
const ONESIGNAL_APP_ID = '865e5cce-41f3-4136-a2c7-d6da9044a3ca';
const ONESIGNAL_CONFIGURAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ONESIGNAL_APP_ID);

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
               'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
const ZILE_SAPTAMANA = ['Dum','Lun','Mar','Mie','Joi','Vin','Sâm'];
const ZILE_LUNGI = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
const LUNI_GENITIV = ['ianuarie','februarie','martie','aprilie','mai','iunie',
                       'iulie','august','septembrie','octombrie','noiembrie','decembrie'];

/**
 * Formatează un obiect Date într-un string de tipul "Ziua, DD LLLL YYYY".
 * Exemplu: "Marți, 16 Iunie 2026"
 */
function formatDateForTitle(dateObj) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return dateObj.toLocaleDateString('ro-RO', options);
}

// ─── Stare globală ────────────────────────────────────────────────────────────
let calendarData = null;
let supabaseData = null;
let lunaAfisata = new Date().getMonth();
let anAfisat = new Date().getFullYear();
let deferredPrompt = null;

// ─── Rutele SPA permanente ────────────────────────────────────────────────────
// Fiecare rută are: path, titlu, descriere, containerID, metaGenerator
const RUTE_SPA = {
  '/': {
    container: 'pagina-acasa',
    titluFn: (d, azi) => `Calendar Ortodox - ${formatDateForTitle(azi)} — ${d.sfant_nume || 'Sfântul zilei'} | Povești de Credință`,
    descFn: (d, azi) => `Sfântul zilei ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}: ${d.sfant_nume || 'Sfântul zilei'}. Calendar ortodox românesc, sinaxar, tropar și rugăciuni.`.substring(0, 160)
  },
  '/sfintii-zilei': {
    container: 'ruta-sfintii-zilei',
    titluFn: (d, azi) => `Sfinții Zilei - ${formatDateForTitle(azi)} — ${d.sfant_nume || 'Sfântul zilei'} | Povești de Credință`,
    descFn: (d, azi) => `Icoana, troparul și prăznuirea ${d.sfant_nume || 'sfinților'} în ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}. Calendar ortodox românesc oficial.`.substring(0, 160)
  },
  '/sinaxar': {
    container: 'ruta-sinaxar',
    titluFn: (d, azi) => `Sinaxar - ${formatDateForTitle(azi)} — Viața ${d.sfant_nume || 'Sfinților'} | Povești de Credință`,
    descFn: (d, azi) => `Viața completă și pătimirea ${d.sfant_nume || 'sfinților'} din ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]}. Sinaxar ortodox conform Mineiului BOR.`.substring(0, 160)
  },
  '/apostolul-zilei': {
    container: 'ruta-apostolul-zilei',
    titluFn: (d, azi) => `Apostolul Zilei - ${formatDateForTitle(azi)} — ${d.apostol_carte || 'Pericopa Apostolică'} | Povești de Credință`,
    descFn: (d, azi) => `Pericopa apostolică din ${d.apostol_carte || 'Epistolele Apostolice'} ${d.apostol_versete || ''} citită în ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()} la Sfânta Liturghie.`.substring(0, 160)
  },
  '/evanghelia-zilei': {
    container: 'ruta-evanghelia-zilei',
    titluFn: (d, azi) => `Evanghelia Zilei - ${formatDateForTitle(azi)} — ${d.evanghelie_carte || 'Sfânta Evanghelie'} | Povești de Credință`,
    descFn: (d, azi) => `Textul integral al Evangheliei din ${d.evanghelie_carte || 'Sfânta Evanghelie'} ${d.evanghelie_versete || ''} citit în ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`.substring(0, 160)
  },
  '/predica-zilei': {
    container: 'ruta-predica-zilei',
    titluFn: (d, azi) => `Predica și Tâlcuirea Evangheliei de azi, ${formatDateForTitle(azi)} | Povești de Credință`,
    descFn: (d, azi) => `Tâlcuire patristică și cuvânt de folos duhovnicesc pentru ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}. Omilie și predică ortodoxă.`.substring(0, 160)
  },
  '/rugaciunea-zilei': {
    container: 'ruta-rugaciunea-zilei',
    titluFn: (d, azi) => `Rugăciunea Zilei - ${formatDateForTitle(azi)} | Povești de Credință`,
    descFn: () => { const z = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'][new Date().getDay()]; return `Rugăciunile oficiale ale fiecărei zile din săptămână în tradiția Bisericii Ortodoxe. Azi: ${z}.`.substring(0, 160); }
  },
  '/setari-notificari': {
    container: 'ruta-setari-notificari',
    titluFn: () => 'Setări Notificări Duhovnicești | Povești de Credință',
    descFn: () => 'Alege ritmul tău de rugăciune: gândul de dimineață, rugăciunea de prânz și de seară, plus alerte pentru posturi și sărbători ortodoxe.'.substring(0, 160)
  }
};

// ─── Inițializare ─────────────────────────────────────────────────────────────
// ─── Verificare automată la schimbarea zilei (miezul nopții Bucharest) ─────────
let _ultimaDataBucharest = null;
function verificaSchimbareZi() {
  const dataAzi = getDataStrBucharest();
  if (_ultimaDataBucharest && _ultimaDataBucharest !== dataAzi) {
    console.log('🌅 Zi nouă detectată:', dataAzi, '— reîncărcare completă');
    // Ștergem cache-ul și reîncărcăm pagina pentru noua zi liturgică
    try { localStorage.removeItem(PDC_CACHE_KEY); } catch(e) {}
    window.location.reload();
  }
  _ultimaDataBucharest = dataAzi;
}
// Verificăm la fiecare 60 secunde (nu afectează performanța)
setInterval(verificaSchimbareZi, 60000);

document.addEventListener('DOMContentLoaded', async () => {
  // Inițializăm data Bucharest pentru detectarea schimbării zilei
  _ultimaDataBucharest = getDataStrBucharest();
    await Promise.all([
    incarcaDateSupabase(),
    incarcaDate()
  ]);
  // Inițializăm funcțiile non-DOM imediat (fără acces la layout)
  initNavMobil();
  initFAQ();
  initOneSignal();
  initPWA();
  startSchedulerNotificariLocale();
  initRouter();
  // Toate scrierile DOM sunt grupate într-un singur rAF pentru a evita
  // Forced Synchronous Layout (citire geometrie după scriere în același frame)
  requestAnimationFrame(() => {
    afiseazaSfantulZilei();
    afiseazaCuvantulFolos();
    afiseazaLectiiAcasa();
    actualizeazaDataOra();
    afiseazaPostUrmator();
    afiseazaRugaciuneaZilei();
    randeazaCalendar(lunaAfisata, anAfisat);
    handleRoute(window.location.pathname);
  });
});

// ─── Supabase: Încarcă date pentru ziua de azi (fus orar Bucharest + cache) ────
const PDC_CACHE_KEY = 'pdc_cache_v2';
async function incarcaDateSupabase() {
  try {
    // ① Data corectă în fusul orar al României (nu UTC!)
    const dataStr = getDataStrBucharest(); // ex: "2026-06-06"

    // ② Verificăm cache-ul localStorage — valid DOAR pentru ziua curentă Bucharest
    try {
      const cached = localStorage.getItem(PDC_CACHE_KEY);
      if (cached) {
        const obj = JSON.parse(cached);
        if (obj.data === dataStr && obj.rows && obj.rows.length > 0) {
          supabaseData = obj.rows[0];
          console.log('✅ Date din cache (Bucharest):', dataStr, supabaseData.sfant_nume);
          return;
        } else {
          // Ziua s-a schimbat în Bucharest — ștergem cache-ul vechi
          localStorage.removeItem(PDC_CACHE_KEY);
          console.log('🔄 Cache invalidat — zi nouă Bucharest:', dataStr);
        }
      }
    } catch(cacheErr) { /* localStorage indisponibil (modul privat etc.) */ }

    // ③ Fetch din Supabase cu data Bucharest + no-cache
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/zile_ortodoxe?data_calendaristica=eq.${dataStr}&select=*&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = await response.json();

    if (rows && rows.length > 0) {
      supabaseData = rows[0];
      console.log('✅ Date Supabase încărcate (Bucharest):', dataStr, supabaseData.sfant_nume);
      // ④ Salvăm în cache cu data Bucharest ca cheie
      try {
        localStorage.setItem(PDC_CACHE_KEY, JSON.stringify({ data: dataStr, rows }));
      } catch(e) { /* localStorage plin sau indisponibil */ }
    } else {
      console.log('ℹ️  Nu există date Supabase pentru', dataStr, '— folosesc fallback');
    }
  } catch (e) {
    console.warn('⚠️  Supabase indisponibil, folosesc fallback:', e.message);
  }
}

// ─── Încarcă calendar.json (fallback) ────────────────────────────────────────
async function incarcaDate() {
  try {
    const r = await fetch('/data/calendar.json');
    calendarData = await r.json();
  } catch(e) {
    console.error('Eroare la încărcarea datelor:', e);
    calendarData = { "2026": {}, "posturi": {}, "sarbatori_mari": {} };
  }
}

// ─── Helper: obține data corectă în fusul orar Europe/Bucharest ──────────────
/**
 * Returnează un obiect Date care reflectă ZIUA CALENDARISTICĂ din Romania.
 * Folosim Intl.DateTimeFormat pentru a extrage an/lună/zi în Europe/Bucharest,
 * indiferent de ora UTC a serverului sau a dispozitivului utilizatorului.
 */
function getAziBucharest() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  // en-CA produce formatul YYYY-MM-DD direct
  const dataStr = fmt.format(now); // ex: "2026-06-06"
  const [an, luna, zi] = dataStr.split('-').map(Number);
  // Construim un Date la miezul nopții în Bucharest (ora 00:00:00 locală)
  // pentru a păstra compatibilitatea cu getDay(), getMonth() etc.
  return new Date(an, luna - 1, zi, 0, 0, 0, 0);
}
function getAzi() { return getAziBucharest(); }

/**
 * Returnează data de azi în format YYYY-MM-DD conform Europe/Bucharest.
 * ACEASTA este cheia folosită pentru interogarea Supabase.
 */
function getDataStrBucharest() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  return fmt.format(new Date()); // ex: "2026-06-06"
}

function getDateAzi() {
  if (supabaseData) return supabaseData;
  const azi = new Date();
  const sfantData = getSfantPentruData(azi);
  return {
    sfant_nume: sfantData?.sfant || 'Sfântul zilei',
    tip_post: sfantData?.post || 'dezlegare',
    culoare_liturgica: sfantData?.culoare || 'alb',
    rugaciunea_zilei: null,
    apostol_carte: null, apostol_versete: null, apostol_text: null,
    evanghelie_carte: null, evanghelie_versete: null, evanghelie_text: null,
    sinaxar: null, predica: null, cuvant_folos: null, tropar: null
  };
}

function formatDataKey(data) {
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const z = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${m}-${z}`;
}

function getSfantPentruData(data) {
  if (!calendarData) return null;
  const cheie = formatDataKey(data);
  const an = String(data.getFullYear());
  if (calendarData[an] && calendarData[an][cheie]) return calendarData[an][cheie];
  const mz = `${String(data.getMonth()+1).padStart(2,'0')}-${String(data.getDate()).padStart(2,'0')}`;
  if (calendarData[an]) {
    for (const key of Object.keys(calendarData[an])) {
      if (key.endsWith(mz)) return calendarData[an][key];
    }
  }
  const ziSapt = data.getDay();
  const estePost = [3, 5].includes(ziSapt) && ziSapt !== 0;
  return { sfant: 'Sfântul zilei', post: estePost ? 'post' : 'dezlegare', culoare: 'verde' };
}

function getTextPost(tipPost) {
  const texte = {
    'post': '🕯️ Zi de post',
    'post_aspru': '🕯️ Post aspru (fără ulei)',
    'post_strict': '🕯️ Post negru',
    'dezlegare': '✅ Dezlegare deplină',
    'dezlegare_peste': '🐟 Dezlegare la pește',
    'dezlegare_ulei': '🍷 Dezlegare la vin și untdelemn',
    'dezlegare_vin_ulei': '🍷 Dezlegare la vin și untdelemn'
  };
  return texte[tipPost] || '✅ Dezlegare';
}
function getBadgeClass(tipPost) {
  if (tipPost === 'dezlegare') return 'dezlegare';
  if (tipPost === 'dezlegare_peste') return 'dezlegare_peste';
  if (tipPost === 'dezlegare_ulei' || tipPost === 'dezlegare_vin_ulei') return 'dezlegare_ulei';
  if (tipPost === 'post_aspru') return 'post_aspru';
  if (tipPost === 'post_strict') return 'post_strict';
  return 'post';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER SPA — Arhitectura rutelor cu history.pushState
// ═══════════════════════════════════════════════════════════════════════════════

function initRouter() {
  // Interceptăm toate link-urile interne cu data-ruta
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-ruta]');
    if (!link) return;
    e.preventDefault();
    const ruta = link.getAttribute('data-ruta');
    navigheazaLaRuta(ruta);
  });

  // Butonul Înapoi al browserului
  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });
}

function navigheazaLaRuta(ruta) {
  history.pushState(null, null, ruta);
  handleRoute(ruta);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleRoute(pathname) {
  const azi = getAzi();
  const date = getDateAzi();

  // Normalizăm path-ul (eliminăm trailing slash, dacă există)
  const path = pathname.replace(/\/$/, '') || '/';

  // Ascundem toate containerele de rută
  document.querySelectorAll('.ruta-container').forEach(el => {
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
  });

  // Ascundem/afișăm pagina principală
  const paginaAcasa = document.getElementById('pagina-acasa');

  if (path === '/' || path === '') {
    // Pagina principală
    if (paginaAcasa) { paginaAcasa.style.display = 'block'; paginaAcasa.removeAttribute('aria-hidden'); }
    actualizeazaMetaTaguri('/', date, azi, false);
    actualizeazaJsonLd('/', date, azi);
    return;
  }

  // Ascundem pagina principală
  if (paginaAcasa) { paginaAcasa.style.display = 'none'; paginaAcasa.setAttribute('aria-hidden', 'true'); }

  // Gestionăm subruta /rugaciunea-zilei/:slug
  const rugaciuneMatch = path.match(/^\/rugaciunea-zilei\/([a-z]+)$/);
  if (rugaciuneMatch) {
    const slug = rugaciuneMatch[1];
    const rugaciune = (typeof getRugaciuneaDupaSlug !== 'undefined') ? getRugaciuneaDupaSlug(slug) : null;
    const containerZi = document.getElementById('ruta-rugaciunea-zi');
    if (containerZi) {
      containerZi.style.display = 'block';
      containerZi.removeAttribute('aria-hidden');
      randeazaRugaciuneaZi(slug);
      if (rugaciune) {
        actualizeazaMetaTaguriRugaciune(rugaciune);
        injecteazaJsonLdRugaciune(rugaciune, path);
      }
    }
    return;
  }

  const rutaConfig = RUTE_SPA[path];
  if (!rutaConfig) {
    // Rută necunoscută → redirecționăm la home
    navigheazaLaRuta('/');
    return;
  }

  // Afișăm containerul rutei
  const container = document.getElementById(rutaConfig.container);
  if (container) {
    container.style.display = 'block';
    container.removeAttribute('aria-hidden');
    // Populăm conținutul dinamic al rutei
    populeazaRuta(path, container, date, azi);
  }

  // Actualizăm meta tags și JSON-LD pentru ruta curentă
  actualizeazaMetaTaguri(path, date, azi, false);
  actualizeazaJsonLd(path, date, azi);
}

// ─── Populează conținutul dinamic al fiecărei rute ────────────────────────────
function populeazaRuta(path, container, date, azi) {
  const dataFormatata = `${ZILE_LUNGI[azi.getDay()]}, ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}`;
  const titluSfinti = date.sfant_nume || 'Sfântul zilei';

  // Actualizăm data în header-ul rutei
  container.querySelectorAll('.ruta-data-live').forEach(el => {
    el.textContent = dataFormatata;
  });
  container.querySelectorAll('.ruta-titlu-sfinti').forEach(el => {
    el.textContent = titluSfinti;
  });

  switch(path) {
    case '/sfintii-zilei':
      populeazaSfintiiZilei(container, date, azi, titluSfinti, dataFormatata);
      break;
    case '/sinaxar':
      populeazaSinaxar(container, date, azi, titluSfinti, dataFormatata);
      break;
    case '/apostolul-zilei':
      populeazaApostolul(container, date, azi, titluSfinti, dataFormatata);
      break;
    case '/evanghelia-zilei':
      populeazaEvanghelia(container, date, azi, titluSfinti, dataFormatata);
      break;
    case '/predica-zilei':
      populeazaPredica(container, date, azi, titluSfinti, dataFormatata);
      break;
    case '/rugaciunea-zilei':
      randeazaHubRugaciuni();
      actualizeazaMetaTaguriHubRugaciuni();
      break;
    case '/setari-notificari':
      initSetariNotificari();
      break;
  }
}

// ─── /sfintii-zilei ───────────────────────────────────────────────────────────
function populeazaSfintiiZilei(container, date, azi, titluSfinti, dataFormatata) {
  const el = (id) => container.querySelector(`#${id}`);

  const titluEl = el('sfintii-titlu');
  if (titluEl) titluEl.textContent = titluSfinti;

  const postEl = el('sfintii-post');
  if (postEl) {
    postEl.textContent = getTextPost(date.tip_post);
    postEl.className = `badge-post ${getBadgeClass(date.tip_post)}`;
  }

  const troparEl = el('sfintii-tropar');
  if (troparEl) {
    troparEl.textContent = date.tropar ||
      'Troparul sfântului se găsește în Mineiul lunii, la ziua respectivă, conform rânduielii Bisericii Ortodoxe Române.';
  }

  // Buton copiere tropar
  const btnCopieTropar = el('btn-copie-tropar');
  if (btnCopieTropar) {
    btnCopieTropar.onclick = () => {
      navigator.clipboard.writeText(date.tropar || '').then(() => aratToast('✅ Troparul a fost copiat!'));
    };
  }

  // Buton WhatsApp tropar
  const btnWaTropar = el('btn-wa-tropar');
  if (btnWaTropar) {
    btnWaTropar.onclick = () => {
      const text = `${titluSfinti}\n\n${date.tropar || ''}\n\npovestidecredinta.ro/sfintii-zilei`;
      shareWhatsApp(text);
    };
  }
}

// ─── /sinaxar — Pagina completă de lectură (flux fluid, zero click-uri extra) ─
function populeazaSinaxar(container, date, azi, titluSfinti, dataFormatata) {
  // Fallback robust pentru sinaxar
  const sinaxarText = date.sinaxar || date.sfant_viata ||
    `${titluSfinti} este prăznuit în calendarul ortodox pe ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}. Conform Sinaxarului Bisericii Ortodoxe Române, acest sfânt a slujit lui Dumnezeu cu credință deplină și sfințenie, lăsând posterității o pildă vie de viețuire creștinească autentică. Viața sa completă, așa cum este consemnată în Mineiul lunii ${LUNI_GENITIV[azi.getMonth()]}, cuprinde mărturii despre nevoințele, minunile și pătimirile prin care a trecut pentru dragostea lui Hristos. Biserica Ortodoxă Română îl cinstește în fiecare an la această dată, iar credincioșii sunt chemați să se inspire din exemplul său de trăire duhovnicească.`;

  const troparText = date.tropar || '';
  const postText = getTextPost(date.tip_post);

  // Construim întregul conținut al paginii dinamic
  container.innerHTML = `
    <!-- Buton Înapoi -->
    <a href="/" data-ruta="/" class="btn-inapoi-spa" style="display:inline-flex;align-items:center;gap:6px;margin:18px 0 10px 0;font-size:0.92rem;font-weight:600;color:#6B1B2B;background:rgba(107,27,43,0.06);border:1.5px solid rgba(107,27,43,0.2);border-radius:20px;padding:8px 16px;text-decoration:none;cursor:pointer;">
      ← Înapoi la Calendar
    </a>

    <!-- Data curentă -->
    <p style="font-size:0.92rem;color:#6B4D3E;margin:12px 0 6px 0;font-weight:500;">${dataFormatata}</p>

    <!-- Titlul Sfântului H1 -->
    <h1 class="sfinti-titlu">${titluSfinti}</h1>

    <!-- Badge post -->
    <span class="badge-post ${getBadgeClass(date.tip_post)}" >${postText}</span>

    <!-- SINAXAR INTEGRAL -->
    <article class="sinaxar-articol">
      ${sinaxarText.split('\n').filter(p => p.trim()).map(p =>
        `<p class="sinaxar-para">${p.trim()}</p>`
      ).join('')}
    </article>

    <!-- Butoane Copiază + WhatsApp -->
    <div class="btn-grup">
      <button onclick="copieTextSinaxar()" class="btn-actiune btn-copie">
        📋 Copiază Sinaxarul
      </button>
      <button onclick="shareWhatsAppSinaxar()" class="btn-actiune btn-wa">
        💬 Trimite pe WhatsApp
      </button>
    </div>

    <!-- CTA Notificări Contextual -->
    <div style="margin:24px 0;padding:20px;background:rgba(201,168,76,0.08);border:1px dashed var(--auriu);border-radius:16px;text-align:center">
        <p style="font-size:0.9rem;color:var(--visineu-dark);margin-bottom:14px;font-weight:600">🔔 Vrei să primești memento zilnic cu Sfântul Zilei?</p>
        <a href="/setari-notificari" data-ruta="/setari-notificari" style="display:inline-block;background:var(--visineu);color:white;text-decoration:none;padding:12px 24px;border-radius:25px;font-size:0.88rem;font-weight:700;box-shadow:var(--shadow)">
            Setează Notificările
        </a>
    </div>

    ${troparText ? `    <!-- TROPARUL SFÂNTULUI -->
    <section class="tropar-sectiune">
      <h2 class="tropar-titlu">🎵 Troparul Sfântului</h2>
      <p class="tropar-text">${troparText}</p>
    </section>
    ` : ''}

    <!-- CONȚINUT ÎNRUDIT -->
    <section class="continut-inrudit">
      <h3 class="continut-inrudit-titlu">📚 Conținut înrudit pentru azi</h3>
      <div class="linkuri-interne-grid">
        <a href="/evanghelia-zilei" data-ruta="/evanghelia-zilei" class="link-intern-card">
          <span class="link-intern-icon">✝️</span>
          <span class="link-intern-titlu">Evanghelia Zilei</span>
        </a>
        <a href="/apostolul-zilei" data-ruta="/apostolul-zilei" class="link-intern-card">
          <span class="link-intern-icon">📖</span>
          <span class="link-intern-titlu">Apostolul Zilei</span>
        </a>
        <a href="/predica-zilei" data-ruta="/predica-zilei" class="link-intern-card">
          <span class="link-intern-icon">🎙️</span>
          <span class="link-intern-titlu">Predica Zilei</span>
        </a>
        <a href="/rugaciunea-zilei" data-ruta="/rugaciunea-zilei" class="link-intern-card">
          <span class="link-intern-icon">🙏</span>
          <span class="link-intern-titlu">Rugăciunea Zilei</span>
        </a>
      </div>
    </section>
  `;
}

// ─── Funcții helper pentru butoanele Sinaxar ─────────────────────────────────
window.copieTextSinaxar = function() {
  const date = getDateAzi();
  const titlu = date.sfant_nume || 'Sfântul zilei';
  const text = date.sinaxar || date.sfant_viata || '';
  const tropar = date.tropar || '';
  const complet = `${titlu}\n\n${text}${tropar ? '\n\nTroparul:\n' + tropar : ''}\n\n— povestidecredinta.ro/sinaxar`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(complet).then(() => aratToast('✅ Sinaxarul a fost copiat!'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = complet; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    aratToast('✅ Sinaxarul a fost copiat!');
  }
};

window.shareWhatsAppSinaxar = function() {
  const date = getDateAzi();
  const titlu = date.sfant_nume || 'Sfântul zilei';
  const sinaxar = (date.sinaxar || date.sfant_viata || '').substring(0, 500);
  const text = `${titlu}\n\n${sinaxar}...\n\nCitește complet: https://povestidecredinta.ro/sinaxar`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

// ─── /apostolul-zilei ─────────────────────────────────────────────────────────
function populeazaApostolul(container, date, azi, titluSfinti, dataFormatata) {
  const el = (id) => container.querySelector(`#${id}`);

  const referintaEl = el('apostol-referinta');
  if (referintaEl) {
    referintaEl.textContent = (date.apostol_carte && date.apostol_versete)
      ? `${date.apostol_carte} ${date.apostol_versete}`
      : 'Pericopa Apostolică a zilei';
  }

  const textEl = el('apostol-text-complet');
  if (textEl) {
    const text = date.apostol_text ||
      `Textul Apostolului pentru ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()} se găsește în Apostolarul Bisericii Ortodoxe Române, la pericopa rânduită de Sinaxarul BOR pentru această zi. Apostolul este citit la Sfânta Liturghie după Heruvic, înainte de Evanghelie, conform rânduielii liturgice ortodoxe.`;
    textEl.innerHTML = text.split('\n').filter(p => p.trim()).map(p =>
      `<p class="lectie-para">${p.trim()}</p>`
    ).join('');
  }

  // Buton copiere
  const btnCopie = el('btn-copie-apostol');
  if (btnCopie) {
    btnCopie.onclick = () => {
      const txt = date.apostol_text || '';
      navigator.clipboard.writeText(txt).then(() => aratToast('✅ Apostolul a fost copiat!'));
    };
  }

  // ─── Linkuri interne SEO ──────────────────────────────────────────────────────
  const linkuriApostol = el('apostol-linkuri-interne');
  if (linkuriApostol) {
    linkuriApostol.innerHTML = genereazaLinkuriInterne('apostol', date, azi);
    intercepteazaLinkuriRuta(linkuriApostol);
  }
}

// ─── /evanghelia-zilei ────────────────────────────────────────────────────────
function populeazaEvanghelia(container, date, azi, titluSfinti, dataFormatata) {
  const el = (id) => container.querySelector(`#${id}`);

  const referintaEl = el('evanghelie-referinta');
  if (referintaEl) {
    referintaEl.textContent = (date.evanghelie_carte && date.evanghelie_versete)
      ? `${date.evanghelie_carte} ${date.evanghelie_versete}`
      : 'Sfânta Evanghelie a zilei';
  }

  const textEl = el('evanghelie-text-complet');
  if (textEl) {
    const text = date.evanghelie_text ||
      `Textul Evangheliei pentru ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()} se găsește în Evangheliarul Bisericii Ortodoxe Române, la pericopa rânduită de Sinaxarul BOR. Evanghelia este citită la Sfânta Liturghie după Apostol, conform rânduielii liturgice ortodoxe. Cuvântul lui Dumnezeu luminează calea credincioșilor în fiecare zi.`;
    textEl.innerHTML = text.split('\n').filter(p => p.trim()).map(p =>
      `<p class="lectie-para">${p.trim()}</p>`
    ).join('');
  }

  // Buton copiere
  const btnCopie = el('btn-copie-evanghelie');
  if (btnCopie) {
    btnCopie.onclick = () => {
      const txt = date.evanghelie_text || '';
      navigator.clipboard.writeText(txt).then(() => aratToast('✅ Evanghelia a fost copiată!'));
    };
  }

  // ─── Linkuri interne SEO ──────────────────────────────────────────────────────
  const linkuriEvanghelia = el('evanghelie-linkuri-interne');
  if (linkuriEvanghelia) {
    linkuriEvanghelia.innerHTML = genereazaLinkuriInterne('evanghelie', date, azi);
    intercepteazaLinkuriRuta(linkuriEvanghelia);
  }
}

// ─── /predica-zilei ───────────────────────────────────────────────────────────
function populeazaPredica(container, date, azi, titluSfinti, dataFormatata) {
  const el = (id) => container.querySelector(`#${id}`);

  const titluEl = el('predica-titlu-principal');
  if (titluEl) {
    titluEl.textContent = `Tâlcuirea Evangheliei și Cuvântul de Folos — ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}`;
  }

  const textEl = el('predica-text-complet');
  if (textEl) {
    const text = date.predica || date.cuvant_folos ||
      `Cuvântul de folos duhovnicesc pentru ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()} va fi disponibil în curând. Predica și tâlcuirea patristică a Evangheliei zilei sunt pregătite zilnic de echipa Povești de Credință, în conformitate cu învățătura Sfinților Părinți ai Bisericii Ortodoxe. Vă invităm să reveniți pentru a citi cuvântul de folos al zilei.`;
    textEl.innerHTML = text.split('\n').filter(p => p.trim()).map(p =>
      `<p class="lectie-para">${p.trim()}</p>`
    ).join('');
  }

  // ─── Linkuri interne SEO ──────────────────────────────────────────────────────
  const linkuriPredica = el('predica-linkuri-interne');
  if (linkuriPredica) {
    linkuriPredica.innerHTML = genereazaLinkuriInterne('predica', date, azi);
    intercepteazaLinkuriRuta(linkuriPredica);
  }
}

// ─── JSON-LD Dinamic (Article + FAQPage per rută) ─────────────────────────────
function actualizeazaJsonLd(path, date, azi) {
  const titluSfinti = date.sfant_nume || 'Sfântul zilei';
  const dataISO = getDataStrBucharest();
  const siteUrl = 'https://povestidecredinta.ro';

  // Elimină JSON-LD dinamic existent
  document.querySelectorAll('[id^="jsonld-dinamic"]').forEach(el => el.remove());

  // Configurare JSON-LD per rută
  const configs = {
    '/': {
      type: 'Article',
      headline: `Calendar Ortodox - ${formatDateForTitle(azi)} — ${titluSfinti}`,
      description: `Sfântul zilei ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}: ${titluSfinti}. Calendar ortodox românesc, sinaxar, tropar și rugăciuni.`,
      articleBody: date.sinaxar || date.sfant_viata || titluSfinti,
      url: `${siteUrl}/`
    },
    '/sfintii-zilei': {
      type: 'Article',
      headline: `Sfinții Zilei - ${formatDateForTitle(azi)} — ${titluSfinti}`,
      description: `Icoana, troparul și prăznuirea ${titluSfinti} în ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`,
      articleBody: date.tropar || titluSfinti,
      url: `${siteUrl}/sfintii-zilei`
    },
    '/sinaxar': {
      type: 'Article',
      headline: `Sinaxar - ${formatDateForTitle(azi)} — Viața ${titluSfinti}`,
      description: `Viața completă și pătimirea ${titluSfinti} din ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]}. Sinaxar ortodox conform Mineiului BOR.`,
      articleBody: date.sinaxar || date.sfant_viata || titluSfinti,
      url: `${siteUrl}/sinaxar`
    },
    '/apostolul-zilei': {
      type: 'Article',
      headline: `Apostolul Zilei - ${formatDateForTitle(azi)} — ${date.apostol_carte || 'Pericopa Apostolică'}`,
      description: `Pericopa apostolică ${date.apostol_carte || ''} ${date.apostol_versete || ''} citită în ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`,
      articleBody: date.apostol_text || `Apostolul zilei de ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`,
      url: `${siteUrl}/apostolul-zilei`
    },
    '/evanghelia-zilei': {
      type: 'Article',
      headline: `Evanghelia Zilei - ${formatDateForTitle(azi)} — ${date.evanghelie_carte || 'Sfânta Evanghelie'}`,
      description: `Textul integral al Evangheliei ${date.evanghelie_carte || ''} ${date.evanghelie_versete || ''} din ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`,
      articleBody: date.evanghelie_text || `Evanghelia zilei de ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`,
      url: `${siteUrl}/evanghelia-zilei`
    },
    '/predica-zilei': {
      type: 'Article',
      headline: `Predica și Tâlcuirea Evangheliei de azi, ${formatDateForTitle(azi)}`,
      description: `Tâlcuire patristică și cuvânt de folos duhovnicesc pentru ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`,
      articleBody: date.predica || date.cuvant_folos || `Predica zilei de ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`,
      url: `${siteUrl}/predica-zilei`
    }
  };

  const cfg = configs[path] || configs['/'];

  // JSON-LD Article
  const scriptArticle = document.createElement('script');
  scriptArticle.type = 'application/ld+json';
  scriptArticle.id = 'jsonld-dinamic-article';
  scriptArticle.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": cfg.headline,
    "description": cfg.description.substring(0, 300),
    "articleBody": (cfg.articleBody || '').substring(0, 2000),
    "datePublished": dataISO,
    "dateModified": dataISO,
    "author": {
      "@type": "Organization",
      "name": "Povești de Credință",
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Povești de Credință",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": cfg.url
    },
    "keywords": `calendar ortodox, sfântul zilei, ${titluSfinti}, ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}, sinaxar ortodox, tropar, rugăciuni ortodoxe`
  });
  document.head.appendChild(scriptArticle);

  // JSON-LD FAQPage (static, nu se schimbă zilnic — autoritate SEO permanentă)
  const faqData = getFaqDataPentruRuta(path);
  if (faqData.length > 0) {
    const scriptFaq = document.createElement('script');
    scriptFaq.type = 'application/ld+json';
    scriptFaq.id = 'jsonld-dinamic-faq';
    scriptFaq.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    });
    document.head.appendChild(scriptFaq);
  }
}

// ─── Date FAQ statice per rută (autoritate SEO permanentă) ────────────────────
function getFaqDataPentruRuta(path) {
  const faqs = {
    '/sfintii-zilei': [
      { q: 'Cine sunt sfinții zilei în calendarul ortodox?', a: 'Sfinții zilei sunt persoane sfinte prăznuite de Biserica Ortodoxă în ziua respectivă, conform Sinaxarului BOR. Ei sunt modele de viață creștinească și mijlocitori în rugăciune.' },
      { q: 'Ce este troparul unui sfânt?', a: 'Troparul este imnul liturgic principal dedicat unui sfânt sau sărbători, care rezumă viața și virtuțile sfântului respectiv. Se cântă la Vecernie, Utrenie și Sfânta Liturghie.' },
      { q: 'De ce cinstim sfinții în Biserica Ortodoxă?', a: 'Cinstim sfinții deoarece ei sunt prietenii lui Dumnezeu, care prin viața lor au arătat că poruncile evanghelice pot fi împlinite. Ei sunt mijlocitori pentru noi înaintea lui Dumnezeu.' },
      { q: 'Ce înseamnă icoana unui sfânt?', a: 'Icoana este o fereastră spre lumea spirituală, o reprezentare sfântă a sfântului care ne ajută să ne concentrăm rugăciunea. Nu ne închinăm icoanei, ci sfântului reprezentat pe ea.' }
    ],
    '/sinaxar': [
      { q: 'Ce este Sinaxarul în Biserica Ortodoxă?', a: 'Sinaxarul este cartea liturgică ortodoxă care cuprinde viețile sfinților prăznuiți în fiecare zi a anului, citite la Utrenie. Cuvântul vine din grecescul "synaxis" (adunare).' },
      { q: 'Cum se deosebește Sinaxarul de Mineiu?', a: 'Mineiurile sunt cărți liturgice lunare care conțin slujbele complete ale sfinților, în timp ce Sinaxarul cuprinde doar viețile sfinților, citite ca lectură la Utrenie.' },
      { q: 'De ce este importantă cunoașterea vieții sfinților?', a: 'Viețile sfinților sunt exemple concrete de împlinire a Evangheliei în viața cotidiană. Ele ne inspiră, ne întăresc credința și ne arată că sfințenia este posibilă pentru orice creștin.' },
      { q: 'Cine a scris Sinaxarul Bisericii Ortodoxe Române?', a: 'Sinaxarul BOR a fost elaborat de Patriarhia Română pe baza izvoarelor patristice și hagiografice ale Bisericii Ortodoxe, adaptate pentru credincioșii români.' }
    ],
    '/apostolul-zilei': [
      { q: 'Ce este Apostolul în cadrul Sfintei Liturghii?', a: 'Apostolul este pericopa (fragmentul) din Epistolele Apostolice (Faptele Apostolilor, Epistolele Sf. Pavel, Petru, Ioan, Iacov, Iuda) citită la Sfânta Liturghie înainte de Evanghelie.' },
      { q: 'De ce se citește Apostolul la Liturghie?', a: 'Apostolul face parte din Liturghia Cuvântului, alături de Evanghelie. Prin el, credincioșii ascultă învățătura apostolică și sunt pregătiți pentru primirea Cuvântului lui Dumnezeu din Evanghelie.' },
      { q: 'Cine citește Apostolul în biserică?', a: 'Apostolul este citit de citeț (cântărețul bisericesc) sau de un diacon, de pe amvon, față de credincioși, cu voce clară și solemnă.' },
      { q: 'Ce este o pericopă apostolică?', a: 'Pericopa apostolică este un fragment din Epistolele Apostolice, selectat de Tipicul Bisericii pentru a fi citit într-o anumită zi liturgică, în funcție de sărbătoarea sau sfântul prăznuit.' }
    ],
    '/evanghelia-zilei': [
      { q: 'Ce este Evanghelia zilei în calendarul ortodox?', a: 'Evanghelia zilei este pericopa (fragmentul) din una dintre cele patru Evanghelii (Matei, Marcu, Luca, Ioan) rânduită de Tipicul Bisericii pentru a fi citită la Sfânta Liturghie în ziua respectivă.' },
      { q: 'De ce se citește Evanghelia în picioare?', a: 'Credincioșii stau în picioare la citirea Evangheliei ca semn de respect față de Cuvântul lui Dumnezeu și ca pregătire pentru primirea lui Hristos în Sfânta Euharistie.' },
      { q: 'Cine citește Evanghelia la Sfânta Liturghie?', a: 'Evanghelia este citită de preot sau diacon, din Evangheliar, în mijlocul bisericii sau de pe amvon, față de credincioși, după ce a fost binecuvântată.' },
      { q: 'Ce reprezintă cele patru Evanghelii?', a: 'Cele patru Evanghelii (Matei, Marcu, Luca, Ioan) sunt mărturiile inspirate ale vieții, învățăturii, morții și învierii Mântuitorului Iisus Hristos, scrise de Sfinții Evangheliști.' }
    ],
    '/predica-zilei': [
      { q: 'Ce este predica în cadrul Sfintei Liturghii?', a: 'Predica este cuvântul de învățătură rostit de preot sau episcop după citirea Evangheliei, prin care se tâlcuiesc textele scripturistice și se aplică la viața creștinilor.' },
      { q: 'Ce este tâlcuirea patristică a Evangheliei?', a: 'Tâlcuirea patristică este interpretarea Evangheliei de către Sfinții Părinți ai Bisericii (Sf. Ioan Gură de Aur, Sf. Chiril al Alexandriei etc.), care constituie tradiția vie a Bisericii.' },
      { q: 'Cum ne ajută predica în viața de zi cu zi?', a: 'Predica traduce mesajul Evangheliei în termeni practici, ajutându-ne să aplicăm învățătura lui Hristos în situațiile concrete ale vieții cotidiene, la locul de muncă, în familie și în societate.' },
      { q: 'Ce este omilia creștină?', a: 'Omilia (din gr. homilia = convorbire) este un tip de predică care urmărește pas cu pas textul scripturistic, comentând și explicând fiecare verset în parte, în stil accesibil credincioșilor.' }
    ]
  };
  return faqs[path] || [];
}

// ─── Meta Tags Dinamice SEO (pagina principală) ───────────────────────────────
function actualizeazaMetaTaguri(path, d, azi, isDateSpecificRoute) {
  const ruta = RUTE_SPA[path];
  const titlu = ruta && ruta.titluFn ? ruta.titluFn(d, azi) : `Povești de Credință - ${formatDateForTitle(azi)}`;
  const descriere = ruta && ruta.descFn ? ruta.descFn(d, azi) : `Povești de Credință - Resurse ortodoxe zilnice: Sinaxar, Viețile Sfinților, Apostolul și Evanghelia zilei, Predici și Rugăciuni.`.substring(0, 160);

  document.title = titlu;

  // Actualizează H1
  const h1Element = document.querySelector("h1");
  if (h1Element) {
    h1Element.textContent = titlu.split(" — ")[0].split(" | ")[0]; // Folosim doar prima parte a titlului pentru H1
  }

  // Actualizează tag-urile canonice
  let canonicalLink = document.querySelector("link[rel=\"canonical\"]");
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalLink);
  }

  if (isDateSpecificRoute) {
    const dataStr = `${azi.getFullYear()}-${(azi.getMonth() + 1).toString().padStart(2, '0')}-${azi.getDate().toString().padStart(2, '0')}`;
    canonicalLink.setAttribute("href", `${window.location.origin}/ziua/${dataStr}`);
  } else {
    canonicalLink.setAttribute("href", window.location.origin + path);
  }

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', descriere);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', titlu);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', descriere);

  const metaDatePublished = document.getElementById('meta-date-published');
  if (metaDatePublished) metaDatePublished.setAttribute('content', `${azi.getFullYear()}-${(azi.getMonth() + 1).toString().padStart(2, '0')}-${azi.getDate().toString().padStart(2, '0')}`);
}

// ─── Sfântul Zilei (homepage) ─────────────────────────────────────────────────
function afiseazaSfantulZilei() {
  const azi = getAzi();
  const date = getDateAzi();

  const ziSaptEl = document.getElementById('zi-saptamana');
  const sfantNumeEl = document.getElementById('sfant-nume');
  const sfantScurtEl = document.getElementById('sfant-scurt');
  const badgePostEl = document.getElementById('badge-post');
  const postTextEl = document.getElementById('post-text');

  const ziSapt = ZILE_SAPTAMANA[azi.getDay()];
  const dataFormatata = `${ziSapt}, ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}`;

  if (ziSaptEl) ziSaptEl.textContent = dataFormatata;
  if (sfantNumeEl) sfantNumeEl.textContent = date.sfant_nume || 'Sfântul zilei';

  if (sfantScurtEl) {
    const textScurt = date.sinaxar || date.sfant_viata;
    sfantScurtEl.textContent = textScurt
      ? textScurt.substring(0, 150) + '...'
      : `Prăznuit în calendarul ortodox pe ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}.`;
  }
  if (badgePostEl) {
    badgePostEl.textContent = getTextPost(date.tip_post);
    badgePostEl.className = `badge-post ${getBadgeClass(date.tip_post)}`;
  }
  if (postTextEl) postTextEl.textContent = getTextPost(date.tip_post);
}

// ─── Cuvântul de Folos al Zilei (homepage) ──────────────────────────────────
function afiseazaCuvantulFolos() {
  try {
    const date = getDateAzi();
    const paragrafEl = document.getElementById('cuvant-folos-paragraf');
    const autorEl = document.getElementById('cuvant-folos-autor');

    if (!paragrafEl) return;

    // Fallback-uri teologice robuste — NICIODATĂ "Se încarcă..."
    const FALLBACK_CITATE = [
      { citat: 'Cel ce iubește pe Dumnezeu, acela este iubit de El; și cel iubit de Dumnezeu nu va rămâne în întuneric.', autor: 'Sfântul Ioan Evanghelistul' },
      { citat: 'Nu te teme de ispite, că prin ele vei afla comori pe care nu le-ai cunoscut.', autor: 'Sfântul Isaac Sirul' },
      { citat: 'Rugăciunea este hrana sufletului. Nu lipsi sufletul tău de hrană, precum nu lipsești trupul de pâine.', autor: 'Sfântul Ioan Gură de Aur' },
      { citat: 'Smerenia este temelia tuturor virtuților. Fără ea, toate faptele bune sunt zadarnice.', autor: 'Sfântul Vasile cel Mare' },
      { citat: 'Dacă vrei să afli pacea sufletului, supune-te voii lui Dumnezeu în toate lucrurile.', autor: 'Sfântul Serafim de Sarov' }
    ];

    if (date.cuvant_folos && typeof date.cuvant_folos === 'string' && date.cuvant_folos.trim().length > 20) {
      var parts = date.cuvant_folos.split(/\n|\u2014|\u2013|—|–/);
      var citat = parts[0] ? parts[0].trim() : date.cuvant_folos.trim();
      var sursa = parts.length > 1 ? parts.slice(1).join(' ').trim() : '';
      paragrafEl.textContent = citat;
      if (autorEl) autorEl.textContent = sursa ? ('— ' + sursa) : '— Sfântul zilei';
    } else {
      var idx = new Date().getDay() % FALLBACK_CITATE.length;
      paragrafEl.textContent = FALLBACK_CITATE[idx].citat;
      if (autorEl) autorEl.textContent = '— ' + FALLBACK_CITATE[idx].autor;
    }
  } catch(e) {
    console.warn('afiseazaCuvantulFolos error:', e);
    var p = document.getElementById('cuvant-folos-paragraf');
    if (p) p.textContent = 'Rugăciunea este hrana sufletului. Nu lipsi sufletul tău de hrană, precum nu lipsești trupul de pâine.';
    var a = document.getElementById('cuvant-folos-autor');
    if (a) a.textContent = '— Sfântul Ioan Gură de Aur';
  }
}

// ─── Populare secțiuni Evanghelie / Apostol / Predică pe homepage ─────────────
function afiseazaLectiiAcasa() {
  try {
    const date = getDateAzi();
    const azi = getAzi();
    const ziua = azi.getDate();
    const luna = LUNI_GENITIV[azi.getMonth()];
    const an = azi.getFullYear();

    // EVANGHELIA — fallback robust
    const evangRefEl = document.getElementById('evanghelie-ref-acasa');
    const evangTextEl = document.getElementById('evanghelie-text-acasa');
    if (evangRefEl) {
      evangRefEl.textContent = (date.evanghelie_carte && date.evanghelie_versete)
        ? date.evanghelie_carte + ' ' + date.evanghelie_versete
        : 'Sfânta Evanghelie a zilei — ' + ziua + ' ' + luna + ' ' + an;
    }
    if (evangTextEl) {
      if (date.evanghelie_text && date.evanghelie_text.trim().length > 10) {
        evangTextEl.textContent = date.evanghelie_text.substring(0, 300) + '...';
      } else {
        evangTextEl.textContent = 'Zis-a Domnul: Eu sunt lumina lumii; cel ce Îmi urmează Mie nu va umbla în întuneric, ci va avea lumina vieții. Evanghelia zilei se citește la Sfânta Liturghie conform rânduielii Sinaxarului BOR.';
      }
    }

    // APOSTOLUL — fallback robust
    const apostolRefEl = document.getElementById('apostol-ref-acasa');
    const apostolTextEl = document.getElementById('apostol-text-acasa');
    if (apostolRefEl) {
      apostolRefEl.textContent = (date.apostol_carte && date.apostol_versete)
        ? date.apostol_carte + ' ' + date.apostol_versete
        : 'Pericopa Apostolică — ' + ziua + ' ' + luna + ' ' + an;
    }
    if (apostolTextEl) {
      if (date.apostol_text && date.apostol_text.trim().length > 10) {
        apostolTextEl.textContent = date.apostol_text.substring(0, 300) + '...';
      } else {
        apostolTextEl.textContent = 'Fraților, să umblăm cu vrednicie în chemarea cu care am fost chemați, cu toată smerenia și blândețea, cu îndelungă-răbdare, îngăduindu-ne unii pe alții în dragoste. Apostolul zilei conform Apostolarului BOR.';
      }
    }

    // PREDICA — fallback robust
    const predicaTextEl = document.getElementById('predica-text-acasa');
    if (predicaTextEl) {
      if (date.predica && date.predica.trim().length > 10) {
        predicaTextEl.textContent = date.predica.substring(0, 350) + '...';
      } else if (date.cuvant_folos && date.cuvant_folos.trim().length > 10) {
        predicaTextEl.textContent = date.cuvant_folos.substring(0, 350) + '...';
      } else {
        predicaTextEl.textContent = 'Iubiți credincioși, Evanghelia de astăzi ne cheamă la pocăință și la întoarcerea inimii către Dumnezeu. Sfântul Ioan Gură de Aur ne învață că fiecare zi este un dar al lui Dumnezeu, o nouă șansă de a ne apropia de El prin rugăciune, post și fapte bune.';
      }
    }
  } catch(e) {
    console.warn('afiseazaLectiiAcasa error:', e);
    var ev = document.getElementById('evanghelie-text-acasa');
    if (ev) ev.textContent = 'Zis-a Domnul: Eu sunt lumina lumii; cel ce Îmi urmează Mie nu va umbla în întuneric, ci va avea lumina vieții.';
    var ap = document.getElementById('apostol-text-acasa');
    if (ap) ap.textContent = 'Fraților, să umblăm cu vrednicie în chemarea cu care am fost chemați, cu toată smerenia și blândețea.';
    var pr = document.getElementById('predica-text-acasa');
    if (pr) pr.textContent = 'Evanghelia de astăzi ne cheamă la pocăință și la întoarcerea inimii către Dumnezeu.';
  }
}

// ─── Funcție globală pentru copierea Cuvântului de Folos ─────────────────────
function copieCuvantFolos() {
  var paragraf = document.getElementById('cuvant-folos-paragraf');
  var autor = document.getElementById('cuvant-folos-autor');
  var text = (paragraf ? paragraf.textContent : '') + (autor ? ' ' + autor.textContent : '');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() { aratToast('✅ Citatul a fost copiat!'); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    aratToast('✅ Citatul a fost copiat!');
  }
}
window.copieCuvantFolos = copieCuvantFolos;

// ─── Calendar ─────────────────────────────────────────────────────────────────
function randeazaCalendar(luna, an) {
  const container = document.getElementById('calendar-grid');
  const titluEl = document.getElementById('calendar-titlu');
  if (!container) return;

  if (titluEl) titluEl.textContent = `${LUNI[luna]} ${an}`;

  const primaZi = new Date(an, luna, 1);
  const ultimaZi = new Date(an, luna + 1, 0);
  const azi = getAzi();

  let startZi = primaZi.getDay();
  startZi = (startZi + 6) % 7;

  let html = '';
  const lunaPrec = new Date(an, luna, 0);
  for (let i = startZi - 1; i >= 0; i--) {
    html += `<div class="calendar-zi alta-luna"><span class="zi-nr">${lunaPrec.getDate() - i}</span></div>`;
  }

  for (let zi = 1; zi <= ultimaZi.getDate(); zi++) {
    const dataZi = new Date(an, luna, zi);
    const esteAzi = dataZi.toDateString() === azi.toDateString();
    const esteDuminica = dataZi.getDay() === 0;
    const sfantData = getSfantPentruData(dataZi);
    const esteSarbatoare = sfantData && sfantData.culoare && sfantData.culoare !== 'verde';

    let clase = 'calendar-zi';
    if (esteAzi) clase += ' azi';
    if (esteDuminica) clase += ' duminica';
    if (esteSarbatoare) clase += ' sarbatoare';

    const sfantNume = sfantData ? sfantData.sfant : '';
    const sfantScurt = sfantNume.replace('Sfântul ', 'Sf. ').replace('Sfânta ', 'Sf. ').substring(0, 18);

    html += `
      <div class="${clase}" onclick="deschideModalZi(${zi}, ${luna}, ${an})">
        <span class="zi-nr">${zi}</span>
        <span class="zi-sfant">${sfantScurt}</span>
      </div>`;
  }

  const totalCelule = Math.ceil((startZi + ultimaZi.getDate()) / 7) * 7;
  for (let zi = 1; zi <= totalCelule - startZi - ultimaZi.getDate(); zi++) {
    html += `<div class="calendar-zi alta-luna"><span class="zi-nr">${zi}</span></div>`;
  }

  container.innerHTML = html;
}

function navigheazaCalendar(directie) {
  lunaAfisata += directie;
  if (lunaAfisata > 11) { lunaAfisata = 0; anAfisat++; }
  if (lunaAfisata < 0) { lunaAfisata = 11; anAfisat--; }
  randeazaCalendar(lunaAfisata, anAfisat);
}

// ─── Modal zi calendar ────────────────────────────────────────────────────────
function deschideModalZi(zi, luna, an) {
  const data = new Date(an, luna, zi);
  const sfantData = getSfantPentruData(data);
  const modal = document.getElementById('modal-zi');
  if (!modal) return;

  document.getElementById('modal-data').textContent =
    `${ZILE_LUNGI[data.getDay()]}, ${zi} ${LUNI_GENITIV[luna]} ${an}`;

  document.getElementById('modal-sfant-text').innerHTML = sfantData ? `
    <strong style="color:var(--visineu);font-family:var(--font-titlu)">${sfantData.sfant}</strong><br><br>
    <span>${getTextPost(sfantData.post)}</span>
  ` : 'Informații indisponibile.';

  modal.classList.add('deschis');
  document.body.style.overflow = 'hidden';
}

function inchideModal() {
  const modal = document.getElementById('modal-zi');
  if (modal) modal.classList.remove('deschis');
  document.body.style.overflow = '';
}

// ─── Post următor ─────────────────────────────────────────────────────────────
function afiseazaPostUrmator() {
  if (!calendarData || !calendarData.posturi) return;
  const azi = getAzi();
  const posturi = calendarData.posturi;
  let postUrmator = null;
  let zileRamase = Infinity;

  for (const [, post] of Object.entries(posturi)) {
    const startPost = new Date(post.start);
    const endPost = new Date(post.end);
    if (startPost > azi) {
      const diff = Math.ceil((startPost - azi) / 86400000);
      if (diff < zileRamase) { zileRamase = diff; postUrmator = { ...post, inProgress: false }; }
    } else if (azi >= startPost && azi <= endPost) {
      const diff = Math.ceil((endPost - azi) / 86400000);
      postUrmator = { ...post, inProgress: true, zileRamase: diff };
      zileRamase = -1; break;
    }
  }

  if (!postUrmator) return;
  const el = document.getElementById('card-post-info');
  if (!el) return;

  if (postUrmator.inProgress) {
    el.innerHTML = `
      <div class="card-post-label">⛪ Post în desfășurare</div>
      <div class="card-post-titlu">${postUrmator.nume}</div>
      <div class="card-post-info">Se termină pe ${new Date(postUrmator.end).toLocaleDateString('ro-RO',{day:'numeric',month:'long'})}</div>
      <span class="card-post-countdown">Mai sunt ${postUrmator.zileRamase} zile</span>`;
  } else {
    el.innerHTML = `
      <div class="card-post-label">🕯️ Următorul post</div>
      <div class="card-post-titlu">${postUrmator.nume}</div>
      <div class="card-post-info">Începe pe ${new Date(postUrmator.start).toLocaleDateString('ro-RO',{day:'numeric',month:'long'})}</div>
      <span class="card-post-countdown">Peste ${zileRamase} zile</span>`;
  }
}

// ─── Rugăciunea zilei ─────────────────────────────────────────────────────────
const rugaciuni = [
  { titlu: "Rugăciunea dimineții", text: "Doamne Iisuse Hristoase, Fiul lui Dumnezeu, pentru rugăciunile Preacuratei Maicii Tale, ale Sfinților Părinților noștri și ale tuturor Sfinților, miluiește-mă pe mine, păcătosul. Amin." },
  { titlu: "Rugăciunea lui Iisus", text: "Doamne Iisuse Hristoase, Fiul lui Dumnezeu, miluiește-mă pe mine, păcătosul." },
  { titlu: "Rugăciunea Tatăl Nostru", text: "Tatăl nostru, Care ești în ceruri, sfințească-Se numele Tău, vie împărăția Ta, facă-Se voia Ta, precum în cer, așa și pe pământ. Pâinea noastră cea de toate zilele dă-ne-o nouă astăzi și ne iartă nouă greșalele noastre, precum și noi iertăm greșiților noștri. Și nu ne duce pe noi în ispită, ci ne izbăvește de cel rău. Amin." },
  { titlu: "Rugăciunea către Maica Domnului", text: "Născătoare de Dumnezeu, Fecioară, bucură-te, Marie, cea plină de har, Domnul este cu tine. Binecuvântată ești tu între femei și binecuvântat este rodul pântecelui tău, că ai născut pe Mântuitorul sufletelor noastre." },
  { titlu: "Rugăciunea de mulțumire", text: "Mulțumescu-Ți, Doamne Dumnezeul meu, că m-ai păzit în această noapte. Luminează ochii minții mele și deschide gura mea, ca să mă pot ruga Ție cu vrednicie. Amin." },
  { titlu: "Rugăciunea Vinerii", text: "Doamne Iisuse Hristoase, Cel ce ai pătimit pentru noi pe Cruce, primește rugăciunea noastră de pocăință și ne întărește în credință, nădejde și dragoste. Amin." },
  { titlu: "Rugăciunea serii", text: "Doamne, Dumnezeul nostru, care ai iertat pe Petru Apostolul și pe femeia păcătoasă, nu trece cu vederea suspinul meu, ci miluiește-mă și mă mântuiește ca un iubitor de oameni. Amin." }
];

function afiseazaRugaciuneaZilei() {
  try {
    const azi = getAzi();
    const date = getDateAzi();
    const ziIndex = azi.getDay();

    // ─── SURSĂ UNICĂ: RUGACIUNI_SAPTAMANA din Ceaslov (rugaciuni-saptamana.js) ───
    // NU se citește niciodată din Supabase pentru textul de pe homepage.
    // Textul de preview trebuie să fie IDENTIC cu cel de pe pagina dedicată.
    let rugData = null;
    if (typeof RUGACIUNI_SAPTAMANA !== 'undefined' && RUGACIUNI_SAPTAMANA[ziIndex]) {
      rugData = RUGACIUNI_SAPTAMANA[ziIndex];
    }

    // Titlul din Ceaslov
    const rugaciuneTitlu = rugData ? rugData.titlu : 'Rugăciunea Zilei';

    // Preview 300 caractere din primul paragraf autentic din Ceaslov
    let rugaciunePreview = '';
    if (rugData && rugData.paragrafe && rugData.paragrafe.length > 0) {
      // Găsim primul paragraf real (sărităm separatoarele '— — —' și textele scurte)
      const primaFraza = rugData.paragrafe.find(p => p !== '— — —' && p.length > 30) || rugData.paragrafe[0];
      rugaciunePreview = primaFraza.substring(0, 300) + (primaFraza.length > 300 ? '...' : '');
    } else {
      // Fallback minimal — NICIODATĂ din Supabase
      rugaciunePreview = 'Doamne Iisuse Hristoase, Fiul lui Dumnezeu, miluiește-mă pe mine, păcătosul. Amin.';
    }

    const titluEl = document.getElementById('rugaciune-titlu');
    const textEl = document.getElementById('rugaciune-text');
    if (titluEl) titluEl.textContent = rugaciuneTitlu;
    if (textEl) textEl.textContent = rugaciunePreview;

    // Actualizăm dinamic butonul cu slug-ul zilei curente
    const btnComplet = document.getElementById('btn-rugaciune-completa');
    if (btnComplet && rugData) {
      const slug = rugData.slug;
      const ziNume = rugData.zi;
      btnComplet.href = '/rugaciunea-zilei/' + slug;
      btnComplet.setAttribute('data-ruta', '/rugaciunea-zilei/' + slug);
      btnComplet.textContent = '🙏 Citeste Rugaciunea de ' + ziNume + ' Completa';
      btnComplet.addEventListener('click', function(e) {
        e.preventDefault();
        navigheazaLaRuta('/rugaciunea-zilei/' + slug);
      });
    }
  } catch (e) {
    const textEl = document.getElementById('rugaciune-text');
    if (textEl && textEl.textContent === 'Se incarca...') {
      textEl.textContent = 'Doamne Iisuse Hristoase, Fiul lui Dumnezeu, miluieste-ma pe mine, pacatosul. Amin.';
    }
  }
}

function copieRugaciune() {
  const textEl = document.getElementById('rugaciune-text');
  if (!textEl) return;
  navigator.clipboard.writeText(textEl.textContent).then(() => {
    aratToast('✅ Rugăciunea a fost copiată!');
  }).catch(() => aratToast('Selectează și copiază manual'));
}

// ─── Navigație mobilă ─────────────────────────────────────────────────────────
function initNavMobil() {
  const hamburger = document.getElementById('hamburger');
  const navMobil = document.getElementById('nav-mobil');
  if (hamburger && navMobil) {
    hamburger.addEventListener('click', () => {
      navMobil.classList.toggle('deschis');
      hamburger.setAttribute('aria-expanded', navMobil.classList.contains('deschis'));
    });
  }
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-intrebare').forEach(el => {
    el.addEventListener('click', () => {
      const item = el.parentElement;
      item.classList.toggle('deschis');
      const icon = el.querySelector('.faq-icon');
      if (icon) icon.textContent = item.classList.contains('deschis') ? '−' : '+';
    });
  });
}

// ─── PWA ──────────────────────────────────────────────────────────────────────
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwa-banner');
    if (banner) { banner.classList.add('is-visible'); banner.removeAttribute('inert'); const btn=banner.querySelector('button'); if(btn) btn.removeAttribute('tabindex'); }
  });
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('pwa-banner');
    if (banner) { banner.classList.remove('is-visible'); banner.setAttribute('inert',''); const btn=banner.querySelector('button'); if(btn) btn.setAttribute('tabindex','-1'); }
    deferredPrompt = null;
    aratToast('🙏 Aplicația a fost instalată cu succes!');
  });
}

async function instaleazaPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (result.outcome === 'accepted') aratToast('🙏 Mulțumim că ai instalat aplicația!');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function aratToast(mesaj) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mesaj;
  toast.classList.add('vizibil');
  setTimeout(() => toast.classList.remove('vizibil'), 3000);
}

// ─── Actualizare dată/oră ─────────────────────────────────────────────────────
function actualizeazaDataOra() {
  const el = document.getElementById('data-ora-live');
  if (!el) return;
  el.textContent = getAzi().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  setTimeout(actualizeazaDataOra, 60000);
}

// ─── Share WhatsApp ───────────────────────────────────────────────────────────
function shareWhatsApp(text) {
  const url = encodeURIComponent(text + '\n\npovestidecredinta.ro');
  window.open(`https://wa.me/?text=${url}`, '_blank');
}

// ─── Navigare pagini interne (nav bottom) ────────────────────────────────────
function aratPagina(pagina) {
  document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('activ'));
  const el = document.getElementById(`pagina-${pagina}`);
  if (el) el.style.display = 'block';
  const navEl = document.querySelector(`[data-pagina="${pagina}"]`);
  if (navEl) navEl.classList.add('activ');
  if (pagina === 'calendar') randeazaCalendar(lunaAfisata, anAfisat);
  window.scrollTo(0, 0);
}

// ─── Expunem funcțiile globale ────────────────────────────────────────────────
window.navigheazaCalendar = navigheazaCalendar;
window.deschideModalZi = deschideModalZi;
window.inchideModal = inchideModal;
window.instaleazaPWA = instaleazaPWA;
window.copieRugaciune = copieRugaciune;
window.aratPagina = aratPagina;
window.shareWhatsApp = shareWhatsApp;
window.navigheazaLaRuta = navigheazaLaRuta;

// ═══════════════════════════════════════════════════════════════════════════════
// MODULUL RUGĂCIUNEA ZILEI — Hub & Spoke (8 rute SPA)
// /rugaciunea-zilei  → hub cu toate cele 7 zile
// /rugaciunea-zilei/luni, /marti, /miercuri, /joi, /vineri, /sambata, /duminica
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Randare Hub (/rugaciunea-zilei) ─────────────────────────────────────────
function randeazaHubRugaciuni() {
  const container = document.getElementById('ruta-rugaciunea-zilei');
  if (!container) return;

  const azi = new Date();
  const ziCurenta = azi.getDay();
  const rugAzi = (typeof RUGACIUNI_SAPTAMANA !== 'undefined') ? RUGACIUNI_SAPTAMANA[ziCurenta] : null;
  const zileList = (typeof ZILE_RUGACIUNI !== 'undefined') ? ZILE_RUGACIUNI : [];

  const carduriZile = zileList.map(z => {
    const r = (typeof RUGACIUNI_SAPTAMANA !== 'undefined') ? RUGACIUNI_SAPTAMANA[
      ['duminica','luni','marti','miercuri','joi','vineri','sambata'].indexOf(z.slug)
    ] : null;
    const esteAzi = r && r.slug === (rugAzi ? rugAzi.slug : '');
    return `
      <a href="/rugaciunea-zilei/${z.slug}"
         data-ruta="/rugaciunea-zilei/${z.slug}"
         class="card-zi-rugaciune${esteAzi ? ' card-zi-azi' : ''}"
         style="border-left:4px solid ${r ? r.culoare : '#8B1A1A'}"
         aria-label="Rugăciunea de ${z.zi}">
        <span class="card-zi-icon">${z.icon}</span>
        <div class="card-zi-info">
          <strong>${z.zi}</strong>
          <span>${r ? r.dedicatie.substring(0, 60) + '…' : ''}</span>
        </div>
        ${esteAzi ? '<span class="badge-azi">Azi</span>' : ''}
      </a>`;
  }).join('');

  container.innerHTML = `
    <button class="btn-inapoi" onclick="navigheazaLaRuta('/')" aria-label="Înapoi la pagina principală">
      ← Înapoi
    </button>
    <div class="ruta-header" style="border-left:4px solid #8B1A1A">
      <h1 class="ruta-titlu">🙏 Rugăciunea Zilei — Calendar Ortodox</h1>
      <p class="ruta-subtitlu">
        Fiecare zi a săptămânii are o rugăciune specială în tradiția Bisericii Ortodoxe.
        Alege ziua pentru care vrei să citești rugăciunea completă.
      </p>
    </div>

    ${rugAzi ? `
    <div class="card-rugaciune-azi" style="background:linear-gradient(135deg,#fdf6ec,#fff8f0);border:2px solid ${rugAzi.culoare}">
      <div style="font-size:2rem;margin-bottom:.5rem">${rugAzi.icon}</div>
      <h2 style="color:var(--visineu);font-family:var(--font-titlu);margin:0 0 .5rem">
        Rugăciunea de Azi — ${rugAzi.zi}
      </h2>
      <p class="rug-dedicatie">${rugAzi.dedicatie}</p>
      <a href="/rugaciunea-zilei/${rugAzi.slug}"
         data-ruta="/rugaciunea-zilei/${rugAzi.slug}"
         class="btn-primar">
        Citește Rugăciunea de ${rugAzi.zi} →
      </a>
    </div>` : ''}

    <h2 class="sectiune-titlu-h2">
      📅 Toate Rugăciunile Săptămânii
    </h2>
    <div class="grid-zile-rugaciuni">${carduriZile}</div>

    <div class="interlinking-box">
      <h3>📖 Explorează și alte secțiuni</h3>
      <div class="interlinking-links">
        <a href="/sfintii-zilei" data-ruta="/sfintii-zilei">👼 Sfinții Zilei</a>
        <a href="/sinaxar" data-ruta="/sinaxar">📜 Sinaxarul Zilei</a>
        <a href="/apostolul-zilei" data-ruta="/apostolul-zilei">📖 Apostolul Zilei</a>
        <a href="/evanghelia-zilei" data-ruta="/evanghelia-zilei">✝️ Evanghelia Zilei</a>
        <a href="/predica-zilei" data-ruta="/predica-zilei">🎙️ Predica Zilei</a>
      </div>
    </div>

    <section class="faq-sectiune" aria-label="Întrebări frecvente">
      <h2 class="faq-titlu">❓ Întrebări Frecvente</h2>
      <div class="faq-lista">
        ${[
          { q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?', a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Marțea Sfântului Ioan Botezătorul, Miercurea și Vinerea Sfintei Cruci, Joia Sfinților Apostoli și Sfântului Nicolae, Sâmbăta celor adormiți, iar Duminica Învierii Domnului.' },
          { q: 'De ce este important să citim rugăciunea specifică fiecărei zile?', a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână. Această practică ne ancorează viața cotidiană în spiritualitatea ortodoxă.' },
          { q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?', a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, conform tradiției Bisericii Ortodoxe Române. Fiecare pagină conține și troparul zilei, condacul și FAQ teologic.' },
          { q: 'Pot citi rugăciunile offline pe telefon?', a: 'Da! Aplicația „Povești de Credință" este o PWA (Progressive Web App) care poate fi instalată pe telefon și funcționează complet offline, inclusiv cu toate rugăciunile săptămânii disponibile fără conexiune la internet.' }
        ].map(f => `
          <div class="faq-item">
            <button class="faq-intrebare" aria-expanded="false">
              ${f.q}<span class="faq-icon">+</span>
            </button>
            <div class="faq-raspuns"><p>${f.a}</p></div>
          </div>`).join('')}
      </div>
    </section>`;

  // Re-inițializează FAQ și interceptează linkurile noi
  initFAQ();
  intercepteazaLinkuriRuta(container);
}

// ─── Randare Subpagină Zi (/rugaciunea-zilei/:slug) ───────────────────────────
function randeazaRugaciuneaZi(slug) {
  const container = document.getElementById('ruta-rugaciunea-zi');
  if (!container) return;

  const rugaciune = (typeof getRugaciuneaDupaSlug !== 'undefined')
    ? getRugaciuneaDupaSlug(slug)
    : null;

  if (!rugaciune) {
    container.innerHTML = `
      <button class="btn-inapoi" onclick="navigheazaLaRuta('/rugaciunea-zilei')">← Înapoi</button>
      <p style="text-align:center;padding:2rem;color:#666">Rugăciunea pentru această zi nu a fost găsită.</p>`;
    return;
  }

  const zileList = (typeof ZILE_RUGACIUNI !== 'undefined') ? ZILE_RUGACIUNI : [];
  const linkuriZile = zileList
    .filter(z => z.slug !== slug)
    .map(z => `<a href="/rugaciunea-zilei/${z.slug}" data-ruta="/rugaciunea-zilei/${z.slug}">${z.icon} ${z.zi}</a>`)
    .join('');

  const textHTML = rugaciune.paragrafe.map(p => {
    if (p === '— — —') return '<hr style="border:none;border-top:1px solid #d4b896;margin:1.5rem 0">';
    if (p.endsWith(':')) return `<h3 style="color:var(--visineu);font-family:var(--font-titlu);margin:1.5rem 0 .5rem;font-size:1.05rem">${p}</h3>`;
    return `<p style="margin-bottom:1.2em;line-height:1.8;font-size:1.05rem;color:#3a2a1a">${p}</p>`;
  }).join('');

  const faqHTML = rugaciune.faq.map(f => `
    <div class="faq-item">
      <button class="faq-intrebare" aria-expanded="false">
        ${f.q}<span class="faq-icon">+</span>
      </button>
      <div class="faq-raspuns"><p>${f.a}</p></div>
    </div>`).join('');

  container.innerHTML = `
    <button class="btn-inapoi" onclick="navigheazaLaRuta('/rugaciunea-zilei')" aria-label="Înapoi la toate rugăciunile">
      ← Înapoi la Rugăciunile Săptămânii
    </button>

    <div class="ruta-header" style="border-left:4px solid ${rugaciune.culoare}">
      <div style="font-size:2.5rem;margin-bottom:.5rem">${rugaciune.icon}</div>
      <h1 class="ruta-titlu">${rugaciune.titlu}</h1>
      <p class="ruta-subtitlu">${rugaciune.dedicatie}</p>
    </div>

    <div class="rugaciune-text-container" style="background:#fdf6ec;border-radius:12px;padding:1.5rem;margin:1rem 0 1.5rem;border:1px solid #e8d5b7">
      <div class="rugaciune-text-body" style="font-family:var(--font-titlu);font-style:italic">
        ${textHTML}
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.5rem">
        <button onclick="copieTextRugaciuneZi('${slug}')" class="btn-secundar" style="background:#4a2c2a;color:#fff;border:none;padding:.6rem 1.2rem;border-radius:8px;cursor:pointer;font-size:.9rem">
          📋 Copiază Rugăciunea
        </button>
        <button onclick="shareWhatsApp('${rugaciune.titlu}\\n\\n' + document.querySelector('.rugaciune-text-body').innerText.substring(0,300) + '...')" class="btn-whatsapp" style="background:#25D366;color:#fff;border:none;padding:.6rem 1.2rem;border-radius:8px;cursor:pointer;font-size:.9rem">
          💬 Trimite pe WhatsApp
        </button>
      </div>
    </div>

    <div class="interlinking-box" style="margin:1.5rem 0">
      <h3>🗓️ Rugăciunile celorlalte zile</h3>
      <div class="interlinking-links">${linkuriZile}</div>
    </div>

    <div class="interlinking-box">
      <h3>📖 Explorează și alte secțiuni</h3>
      <div class="interlinking-links">
        <a href="/sfintii-zilei" data-ruta="/sfintii-zilei">👼 Sfinții Zilei</a>
        <a href="/sinaxar" data-ruta="/sinaxar">📜 Sinaxarul Zilei</a>
        <a href="/apostolul-zilei" data-ruta="/apostolul-zilei">📖 Apostolul Zilei</a>
        <a href="/evanghelia-zilei" data-ruta="/evanghelia-zilei">✝️ Evanghelia Zilei</a>
        <a href="/predica-zilei" data-ruta="/predica-zilei">🎙️ Predica Zilei</a>
      </div>
    </div>

    <section class="faq-sectiune" aria-label="Întrebări frecvente">
      <h2 class="faq-titlu">❓ Întrebări Frecvente</h2>
      <div class="faq-lista">${faqHTML}</div>
    </section>`;

  // Re-inițializează FAQ și interceptează linkurile noi
  initFAQ();
  intercepteazaLinkuriRuta(container);
}

// ─── Copiere text rugăciune zi ────────────────────────────────────────────────
function copieTextRugaciuneZi(slug) {
  const rugaciune = (typeof getRugaciuneaDupaSlug !== 'undefined') ? getRugaciuneaDupaSlug(slug) : null;
  if (!rugaciune) return;
  const text = rugaciune.paragrafe.filter(p => p !== '— — —').join('\n\n');
  navigator.clipboard.writeText(rugaciune.titlu + '\n\n' + text)
    .then(() => aratToast('✅ Rugăciunea a fost copiată!'))
    .catch(() => aratToast('Selectează și copiază manual'));
}

// ─── Meta tags pentru rugăciunile zilei ──────────────────────────────────────
function actualizeazaMetaTaguriRugaciune(rugaciune) {
  if (!rugaciune) return;
  document.title = rugaciune.titluSeo + ' | Povești de Credință';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', rugaciune.descSeo.substring(0, 160));
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', rugaciune.titluSeo);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', rugaciune.descSeo.substring(0, 160));
}

function actualizeazaMetaTaguriHubRugaciuni() {
  const azi = new Date();
  const ziSapt = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'][azi.getDay()];
  document.title = `Rugăciunea Zilei — ${ziSapt} | Calendar Ortodox | Povești de Credință`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content',
    `Rugăciunile oficiale ale fiecărei zile din săptămână în tradiția Bisericii Ortodoxe. Texte integrale, curate, din Ceaslovul BOR. Azi: ${ziSapt}.`
  );
}

// ─── JSON-LD pentru rugăciunile zilei ────────────────────────────────────────
function injecteazaJsonLdRugaciune(rugaciune, path) {
  document.querySelectorAll('[id^="jsonld-rug"]').forEach(el => el.remove());
  if (!rugaciune) return;

  const siteUrl = 'https://povestidecredinta.ro';
  const dataISO = getDataStrBucharest();

  const scriptArticle = document.createElement('script');
  scriptArticle.type = 'application/ld+json';
  scriptArticle.id = 'jsonld-rug-article';
  scriptArticle.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": rugaciune.titlu,
    "description": rugaciune.descSeo.substring(0, 300),
    "articleBody": rugaciune.paragrafe.filter(p => p !== '— — —').join(' ').substring(0, 2000),
    "datePublished": dataISO,
    "dateModified": dataISO,
    "author": { "@type": "Organization", "name": "Povești de Credință", "url": siteUrl },
    "publisher": {
      "@type": "Organization",
      "name": "Povești de Credință",
      "logo": { "@type": "ImageObject", "url": `${siteUrl}/images/logo.png` }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${siteUrl}${path}` },
    "keywords": `rugăciunea de ${rugaciune.zi.toLowerCase()}, rugăciune ortodoxă, calendar ortodox, ${rugaciune.zi.toLowerCase()} rugăciune, Povești de Credință`
  });
  document.head.appendChild(scriptArticle);

  if (rugaciune.faq && rugaciune.faq.length > 0) {
    const scriptFaq = document.createElement('script');
    scriptFaq.type = 'application/ld+json';
    scriptFaq.id = 'jsonld-rug-faq';
    scriptFaq.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": rugaciune.faq.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    });
    document.head.appendChild(scriptFaq);
  }
}

// ─── Generator linkuri interne SEO (hub & spoke) ────────────────────────────
function genereazaLinkuriInterne(tipPagina, date, azi) {
  const titluSfinti = date.sfant_nume || 'Sfântul zilei';
  const zi = azi.getDate();
  const luna = LUNI_GENITIV[azi.getMonth()];
  const an = azi.getFullYear();
  const dataStr = `${zi} ${luna} ${an}`;

  const linkuriConfig = {
    apostol: [
      { href: '/evanghelia-zilei', icon: '✝️', titlu: 'Evanghelia Zilei', desc: `Textul integral al Evangheliei pentru ${dataStr}` },
      { href: '/predica-zilei', icon: '🎙️', titlu: 'Predica Zilei', desc: 'Tâlcuirea patristică a Evangheliei de azi' },
      { href: '/sinaxar', icon: '📜', titlu: 'Sinaxarul Zilei', desc: `Viața ${titluSfinti}` },
      { href: '/rugaciunea-zilei', icon: '🙏', titlu: 'Rugăciunea Zilei', desc: 'Rugăciunea din Ceaslov pentru azi' },
    ],
    evanghelie: [
      { href: '/apostolul-zilei', icon: '📖', titlu: 'Apostolul Zilei', desc: `Pericopa apostolică pentru ${dataStr}` },
      { href: '/predica-zilei', icon: '🎙️', titlu: 'Predica Zilei', desc: 'Tâlcuirea patristică a Evangheliei de azi' },
      { href: '/sinaxar', icon: '📜', titlu: 'Sinaxarul Zilei', desc: `Viața ${titluSfinti}` },
      { href: '/rugaciunea-zilei', icon: '🙏', titlu: 'Rugăciunea Zilei', desc: 'Rugăciunea din Ceaslov pentru azi' },
    ],
    predica: [
      { href: '/evanghelia-zilei', icon: '✝️', titlu: 'Evanghelia Zilei', desc: `Textul integral al Evangheliei pentru ${dataStr}` },
      { href: '/apostolul-zilei', icon: '📖', titlu: 'Apostolul Zilei', desc: `Pericopa apostolică pentru ${dataStr}` },
      { href: '/sinaxar', icon: '📜', titlu: 'Sinaxarul Zilei', desc: `Viața ${titluSfinti}` },
      { href: '/rugaciunea-zilei', icon: '🙏', titlu: 'Rugăciunea Zilei', desc: 'Rugăciunea din Ceaslov pentru azi' },
    ],
  };

  const linkuri = linkuriConfig[tipPagina] || linkuriConfig.evanghelie;

  return `
  <section style="margin-top:32px;padding-top:24px;border-top:2px solid rgba(201,168,76,0.3);">
    <h3 style="font-family:'Playfair Display',serif;font-size:1.1rem;color:#4a0e17;margin:0 0 16px 0;font-weight:700;">📚 Continuă lectura duhovnicească</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      ${linkuri.map(l => `
      <a href="${l.href}" data-ruta="${l.href}" style="background:white;border:1.5px solid rgba(201,168,76,0.3);border-radius:14px;padding:16px 12px;text-align:center;text-decoration:none;box-shadow:0 2px 10px rgba(107,27,43,0.07);display:block;" aria-label="${l.titlu} — ${l.desc}">
        <span style="font-size:1.8rem;display:block;margin-bottom:6px;">${l.icon}</span>
        <span style="font-family:'Playfair Display',serif;color:#6B1B2B;font-size:0.85rem;font-weight:700;display:block;margin-bottom:4px;">${l.titlu}</span>
        <span style="color:#666;font-size:0.75rem;line-height:1.4;display:block;">${l.desc}</span>
      </a>`).join('')}
    </div>
    <div style="margin-top:16px;padding:14px;background:rgba(201,168,76,0.06);border-radius:12px;border:1px solid rgba(201,168,76,0.2);">
      <p style="margin:0;font-size:0.85rem;color:#555;text-align:center;">
        📅 <a href="/" data-ruta="/" style="color:#6B1B2B;font-weight:600;text-decoration:none;">Calendar Ortodox ${dataStr}</a>
        &nbsp;·&nbsp;
        <a href="/sfintii-zilei" data-ruta="/sfintii-zilei" style="color:#6B1B2B;font-weight:600;text-decoration:none;">Sfinții Zilei</a>
        &nbsp;·&nbsp;
        <a href="/rugaciunea-zilei" data-ruta="/rugaciunea-zilei" style="color:#6B1B2B;font-weight:600;text-decoration:none;">Rugăciuni</a>
      </p>
    </div>
  </section>`;
}

// ─── Interceptare linkuri cu data-ruta din containerele dinamice ──────────────
function intercepteazaLinkuriRuta(container) {
  if (!container) return;
  container.querySelectorAll('[data-ruta]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigheazaLaRuta(link.getAttribute('data-ruta'));
    });
  });
}

// ─── Expune funcțiile noi global ──────────────────────────────────────────────
window.randeazaHubRugaciuni = randeazaHubRugaciuni;
window.randeazaRugaciuneaZi = randeazaRugaciuneaZi;
window.copieTextRugaciuneZi = copieTextRugaciuneZi;
window.intercepteazaLinkuriRuta = intercepteazaLinkuriRuta;

// ═══════════════════════════════════════════════════════════════════════════════
// MODUL NOTIFICĂRI INTELIGENTE — Panou Setări Duhovnicești (/setari-notificari)
// OneSignal Web Push v16 + Tags de segmentare + persistență localStorage
// ═══════════════════════════════════════════════════════════════════════════════

// Cheia unică pentru preferințele de notificări în localStorage
const PDC_NOTIF_KEY = 'pdc_notificari_v1';

// Valori implicite pentru fiecare segment
const NOTIF_DEFAULTS = {
  dimineata: false,
  pranz: false,
  seara: false,
  seara_ora: '21:30',
  alerte_post: false
};

// Flag intern: SDK OneSignal inițializat
let _oneSignalGata = false;

/**
 * Citește preferințele salvate din localStorage (sau valorile implicite).
 */
function getPreferinteNotif() {
  try {
    const raw = localStorage.getItem(PDC_NOTIF_KEY);
    if (raw) return { ...NOTIF_DEFAULTS, ...JSON.parse(raw) };
  } catch (e) { /* localStorage indisponibil (mod privat etc.) */ }
  return { ...NOTIF_DEFAULTS };
}

/**
 * Salvează preferințele în localStorage.
 */
function salveazaPreferinteNotif(pref) {
  try {
    localStorage.setItem(PDC_NOTIF_KEY, JSON.stringify(pref));
  } catch (e) { /* localStorage indisponibil */ }
}

/**
 * Inițializează SDK-ul OneSignal (asincron, non-blocking).
 * Se apelează o singură dată la încărcarea paginii.
 * Dacă App ID-ul nu este configurat, funcția se oprește discret
 * (UI-ul rămâne funcțional cu localStorage, fără sincronizare push).
 */
function initOneSignal() {
  if (!ONESIGNAL_CONFIGURAT) {
    console.log('ℹ️ OneSignal: App ID neconfigurat — modul UI activ, sincronizare push dezactivată până la înlocuirea placeholder-ului.');
    return;
  }
  // SDK-ul se încarcă async via <script defer> din <head>.
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        // Nu afișăm prompt automat — cerem permisiunea doar la primul toggle.
        autoResubscribe: true,
        notifyButton: { enable: false },
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: 'OneSignalSDKWorker.js'
      });
      _oneSignalGata = true;
      console.log('✅ OneSignal inițializat');
      // La inițializare, re-sincronizăm tag-urile cu starea localStorage
      // (utile dacă userul a modificat preferințele pe alt device sau offline).
      sincronizeazaToateTagurile();
    } catch (err) {
      console.warn('⚠️ OneSignal init eșuat:', err);
    }
  });
}

/**
 * Așteaptă ca SDK-ul OneSignal să fie disponibil și returnează instanța.
 * Rezolvă cu `null` dacă OneSignal nu este configurat.
 */
function asteaptaOneSignal() {
  return new Promise((resolve) => {
    if (!ONESIGNAL_CONFIGURAT) return resolve(null);
    if (window.OneSignal && _oneSignalGata) return resolve(window.OneSignal);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((OneSignal) => resolve(OneSignal));
  });
}

/**
 * Cere permisiunea nativă de notificări (Notification.requestPermission via OneSignal).
 * Returnează true dacă permisiunea a fost acordată.
 */
async function cerePermisiuneNotificari() {
  // Dacă browserul nu suportă notificări deloc
  if (typeof Notification === 'undefined') {
    return false;
  }
  // Deja acordată
  if (Notification.permission === 'granted') {
    return true;
  }
  // Deja refuzată definitiv — nu putem re-cere din cod
  if (Notification.permission === 'denied') {
    return false;
  }
  // Stare 'default' → cerem permisiunea
  const OneSignal = await asteaptaOneSignal();
  if (OneSignal) {
    try {
      // OneSignal v16: declanșează prompt-ul nativ
      await OneSignal.Notifications.requestPermission();
      return Notification.permission === 'granted';
    } catch (e) {
      // Fallback la API nativ dacă OneSignal eșuează
    }
  }
  // Fallback: API nativ Notification
  try {
    const rezultat = await Notification.requestPermission();
    return rezultat === 'granted';
  } catch (e) {
    return false;
  }
}

/**
 * Sincronizează o etichetă (tag) cu OneSignal pentru segmentare.
 * Ex: addTag("dimineata", "true").
 */
async function sincronizeazaTag(cheie, valoare) {
  const OneSignal = await asteaptaOneSignal();
  if (!OneSignal) return; // App ID neconfigurat — skip silențios
  try {
    OneSignal.User.addTag(cheie, String(valoare));
    console.log(`🏷️ Tag sincronizat: ${cheie} = ${valoare}`);
  } catch (e) {
    console.warn(`⚠️ Eroare sincronizare tag ${cheie}:`, e);
  }
}

/**
 * Sincronizează toate tag-urile cu starea curentă din localStorage.
 */
async function sincronizeazaToateTagurile() {
  const OneSignal = await asteaptaOneSignal();
  if (!OneSignal) return;
  const pref = getPreferinteNotif();
  try {
    OneSignal.User.addTags({
      dimineata: String(pref.dimineata),
      pranz: String(pref.pranz),
      seara: String(pref.seara),
      seara_ora: pref.seara_ora,
      alerte_post: String(pref.alerte_post)
    });
    console.log('🏷️ Toate tag-urile sincronizate cu OneSignal');
  } catch (e) {
    console.warn('⚠️ Eroare sincronizare tag-uri:', e);
  }
}

/**
 * Afișează un mesaj de ghidare în panoul de setări.
 */
function afiseazaMesajSetari(text, tip = 'info') {
  const mesajEl = document.getElementById('setari-mesaj');
  if (!mesajEl) return;
  mesajEl.textContent = text;
  mesajEl.className = `setari-mesaj vizibil ${tip}`;
}

function ascundeMesajSetari() {
  const mesajEl = document.getElementById('setari-mesaj');
  if (!mesajEl) return;
  mesajEl.className = 'setari-mesaj';
}

/**
 * Actualizează badge-ul de status al permisiunii de notificări.
 */
function actualizeazaStatusPermisiune() {
  const statusEl = document.getElementById('setari-status-permisiune');
  if (!statusEl) return;
  if (typeof Notification === 'undefined') {
    statusEl.style.display = 'none';
    return;
  }
  statusEl.style.display = 'inline-block';
  const perm = Notification.permission;
  if (perm === 'granted') {
    statusEl.textContent = '🔔 Notificări activate';
    statusEl.className = 'setari-status-permisiune acordata';
  } else if (perm === 'denied') {
    statusEl.textContent = '🔕 Notificări blocate în browser';
    statusEl.className = 'setari-status-permisiune refuzata';
  } else {
    statusEl.textContent = '⚪ Notificări neactivate încă';
    statusEl.className = 'setari-status-permisiune implicita';
  }
}

/**
 * Aplică starea vizuală activ/inactiv pentru un card.
 */
function actualizeazaCardActiv(idCard, activ) {
  const card = document.getElementById(idCard);
  if (card) card.classList.toggle('activ', activ);
}

/**
 * Gestionează schimbarea unui toggle.
 * - La PRIMUL toggle activat, cere permisiunea nativă.
 * - Dacă permisiunea e refuzată, revine toggle-ul pe OFF.
 * - Salvează în localStorage orele personalizate și sincronizează tag-urile.
 */
async function onToggleSchimbat(checkbox) {
  const segment = checkbox.getAttribute('data-segment');
  const activ = checkbox.checked;
  const pref = getPreferinteNotif();

  // Salvez ora personalizată pentru acest segment (dacă există input time)
  const inputOra = document.getElementById(`ora-${segment === 'alerte_post' ? 'alerte' : segment}`);
  if (inputOra && inputOra.value) {
    pref[`${segment}_ora`] = inputOra.value;
  }

  // Verificăm dacă acesta este PRIMUL toggle activat (toate erau OFF)
  const vreunActivInainte = pref.dimineata || pref.pranz || pref.seara || pref.alerte_post;

  if (activ && !vreunActivInainte) {
    // Primul toggle activat → cerem permisiunea nativă ACUM
    const permisiuneOK = await cerePermisiuneNotificari();
    actualizeazaStatusPermisiune();

    if (!permisiuneOK) {
      // Permisiune refuzată → toggle revine pe OFF cu mesaj de ghidare
      checkbox.checked = false;
      actualizeazaCardActiv(`card-${segment === 'alerte_post' ? 'alerte' : segment}`, false);
      if (Notification.permission === 'denied') {
        afiseazaMesajSetari(
          'Notificările sunt blocate în setările browserului. Pentru a le activa, deschide setările site-ului (🔒 lângă adresă) și permite notificările, apoi revino aici.',
          'avertisment'
        );
      } else {
        afiseazaMesajSetari(
          'Ai nevoie să accepți notificările pentru a primi memento-uri. Apasă din nou pe comutator și alege "Permite".',
          'info'
        );
      }
      return;
    }
    afiseazaMesajSetari('🙏 Notificările au fost activate. Vei primi memento-urile alese la orele potrivite.', 'succes');
  }

  // Actualizăm starea în localStorage
  pref[segment] = activ;
  salveazaPreferinteNotif(pref);

  // Actualizăm vizualul cardului
  actualizeazaCardActiv(`card-${segment === 'alerte_post' ? 'alerte' : segment}`, activ);

  // Sincronizăm tag-urile cu OneSignal (inclusiv ora personalizată)
  await sincronizeazaTag(segment, activ);
  if (pref[`${segment}_ora`]) {
    await sincronizeazaTag(`${segment}_ora`, pref[`${segment}_ora`]);
  }

  // Dacă toate toggle-urile sunt acum OFF, ascundem mesajul de succes
  const pref2 = getPreferinteNotif();
  const vreunActivAcum = pref2.dimineata || pref2.pranz || pref2.seara || pref2.alerte_post;
  if (!vreunActivAcum) ascundeMesajSetari();
}

/**
 * Gestionează schimbarea orei personalizate pentru o notificare.
 */
function onOraSchimbata(inputOra) {
  const segment = inputOra.id.replace('ora-', '');
  const segmentKey = segment === 'alerte' ? 'alerte_post' : segment;
  const pref = getPreferinteNotif();
  pref[`${segmentKey}_ora`] = inputOra.value;
  salveazaPreferinteNotif(pref);
  // Sincronizez ora cu OneSignal dacă segmentul este activ
  if (pref[segmentKey]) {
    sincronizeazaTag(`${segmentKey}_ora`, inputOra.value);
  }
}

/**
 * Dezabonează definitiv utilizatorul și șterge ID-ul din OneSignal (GDPR Opt-out).
 */
async function stergeDefinitivID() {
  if (!confirm('Ești sigur că vrei să te dezabonezi definitiv și să ștergi identificatorul acestui dispozitiv? Nu vei mai primi nicio notificare până la o re-abonare manuală.')) {
    return;
  }

  try {
    // 1. Dezactivăm toate toggle-urile în UI și resetez orele
    const pref = { dimineata: false, pranz: false, seara: false, alerte_post: false, dimineata_ora: '07:30', pranz_ora: '13:00', seara_ora: '21:30', alerte_post_ora: '07:30' };
    salveazaPreferinteNotif(pref);
    initSetariNotificari(); // Reîmprospătează UI-ul

    // 2. Dezactivăm push în OneSignal
    if (typeof OneSignal !== 'undefined') {
      await OneSignal.User.PushSubscription.optOut();
      // Ștergem și tag-urile pentru a fi siguri
      await OneSignal.User.deleteTags(['dimineata', 'pranz', 'seara', 'dimineata_ora', 'pranz_ora', 'seara_ora', 'alerte_post', 'alerte_post_ora']);
    }

    afiseazaMesajSetari('✅ Te-ai dezabonat cu succes. Datele de notificare au fost șterse.', 'succes');
    aratToast('Identificator șters cu succes.');
  } catch (e) {
    console.error('Eroare la dezabonare:', e);
    aratToast('A apărut o eroare. Încearcă din setările browserului.');
  }
}/**
 * Gestionează schimbarea orei pentru rugăciunea de seară.
 */
async function onOraSearaSchimbata(input) {
  const ora = input.value || '21:30';
  const pref = getPreferinteNotif();
  pref.seara_ora = ora;
  salveazaPreferinteNotif(pref);
  await sincronizeazaTag('seara_ora', ora);
  if (pref.seara) {
    afiseazaMesajSetari(`🌙 Ora rugăciunii de seară a fost setată la ${ora}.`, 'succes');
  }
}

/**
 * Inițializează panoul de setări la intrarea pe rută.
 * Restaurează starea toggle-urilor din localStorage și atașează handlerii.
 */
function initSetariNotificari() {
  const pref = getPreferinteNotif();

  // Restaurăm starea fiecărui toggle
  const mapToggle = [
    { id: 'toggle-dimineata', segment: 'dimineata', card: 'card-dimineata' },
    { id: 'toggle-pranz', segment: 'pranz', card: 'card-pranz' },
    { id: 'toggle-seara', segment: 'seara', card: 'card-seara' },
    { id: 'toggle-alerte', segment: 'alerte_post', card: 'card-alerte' }
  ];

  mapToggle.forEach(({ id, segment, card }) => {
    const cb = document.getElementById(id);
    if (!cb) return;
    cb.checked = !!pref[segment];
    actualizeazaCardActiv(card, !!pref[segment]);
    // Evităm dublarea handlerilor la re-navigare
    cb.onchange = () => onToggleSchimbat(cb);
  });

  // Restaurăm orele personalizate pentru fiecare segment
  const mapOre = [
    { id: 'ora-dimineata', segment: 'dimineata_ora', default: '07:30' },
    { id: 'ora-pranz', segment: 'pranz_ora', default: '13:00' },
    { id: 'ora-seara', segment: 'seara_ora', default: '21:30' },
    { id: 'ora-alerte', segment: 'alerte_post_ora', default: '07:30' }
  ];

  mapOre.forEach(({ id, segment, default: defaultOra }) => {
    const inputOra = document.getElementById(id);
    if (inputOra) {
      inputOra.value = pref[segment] || defaultOra;
      inputOra.onchange = () => onOraSchimbata(inputOra);
    }
  });

  // Actualizăm statusul permisiunii
  actualizeazaStatusPermisiune();

  // Dacă browserul nu suportă notificări, dezactivăm toggle-urile cu mesaj
  if (typeof Notification === 'undefined') {
    mapToggle.forEach(({ id }) => {
      const cb = document.getElementById(id);
      if (cb) cb.disabled = true;
    });
    afiseazaMesajSetari('Browserul tău nu suportă notificări push. Încearcă să instalezi aplicația pe ecranul de start pentru funcționalitate completă.', 'avertisment');
  } else if (Notification.permission === 'denied') {
    afiseazaMesajSetari('Notificările sunt blocate în setările browserului. Deblochează-le din setările site-ului pentru a primi memento-uri.', 'avertisment');
  } else {
    ascundeMesajSetari();
  }
}

/**
 * Scheduler de notificări locale: Verifică la fiecare minut dacă ora curentă se potrivește
 * cu orele salvate ale utilizatorului și afișează o notificare locală (browser).
 */
let ultimaNotificareMinut = -1; // Evităm duplicate în aceeași minut
function startSchedulerNotificariLocale() {
  setInterval(() => {
    const acum = new Date();
    const oraMinut = `${String(acum.getHours()).padStart(2, '0')}:${String(acum.getMinutes()).padStart(2, '0')}`;
    const minutCurent = acum.getMinutes();

    // Evităm trimiterea de mai mult de o notificare pe minut
    if (minutCurent === ultimaNotificareMinut) return;

    const pref = getPreferinteNotif();
    const segmente = [
      { activ: pref.dimineata, ora: pref.dimineata_ora, titlu: '☀️ Gândul de dimineață', mesaj: 'Bună dimineața! Apasă pentru viața sfântului zilei.' },
      { activ: pref.pranz, ora: pref.pranz_ora, titlu: '🍽️ Rugăciunea de la prânz', mesaj: 'O clipă de mulțumire la mijlocul zilei.' },
      { activ: pref.seara, ora: pref.seara_ora, titlu: '🌙 Rugăciunea de seară', mesaj: 'Liniștea nopții. Încredințează ziua lui Dumnezeu.' },
      { activ: pref.alerte_post, ora: pref.alerte_post_ora, titlu: '🕯️ Alerte Posturi', mesaj: 'Verifică rânduiala postului și dezlegările zilei.' }
    ];

    segmente.forEach(({ activ, ora, titlu, mesaj }) => {
      if (activ && ora === oraMinut && Notification.permission === 'granted') {
        // Afișez notificare locală
        new Notification(titlu, {
          body: mesaj,
          icon: '/images/icon-192.png',
          badge: '/images/icon-192.png',
          tag: 'notificare-locala-' + titlu,
          requireInteraction: false
        });
        ultimaNotificareMinut = minutCurent;
      }
    });
  }, 60000); // Verifică la fiecare 60 de secunde
}

// ─── Expune funcțiile modulului de notificări global ────────────────
window.initSetariNotificari = initSetariNotificari;
window.initOneSignal = initOneSignal;
window.onToggleSchimbat = onToggleSchimbat;
window.onOraSchimbata = onOraSchimbata;
window.stergeDefinitivID = stergeDefinitivID;
window.startSchedulerNotificariLocale = startSchedulerNotificariLocale;
