// POVEȘTI DE CREDINȚĂ — JavaScript Principal
// ============================================
// Versiunea 2.0 — cu integrare Supabase + fallback calendar.json

// ─── Configurare Supabase ─────────────────────────────────────────────────────
const SUPABASE_URL = 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk';

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
               'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
const ZILE_SAPTAMANA = ['Dum','Lun','Mar','Mie','Joi','Vin','Sâm'];
const ZILE_LUNGI = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
const LUNI_GENITIV = ['ianuarie','februarie','martie','aprilie','mai','iunie',
                       'iulie','august','septembrie','octombrie','noiembrie','decembrie'];

let calendarData = null;
let supabaseData = null; // Date din Supabase pentru ziua de azi
let lunaAfisata = new Date().getMonth();
let anAfisat = new Date().getFullYear();
let deferredPrompt = null;

// ─── Inițializare ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Încarcă în paralel: Supabase + calendar.json
  await Promise.all([
    incarcaDateSupabase(),
    incarcaDate()
  ]);
  afiseazaSfantulZilei();
  afiseazaApostolulZilei();
  afiseazaEvanghelia();
  afiseazaSinaxarul();
  afiseazaPredicaZilei();
  randeazaCalendar(lunaAfisata, anAfisat);
  afiseazaPostUrmator();
  afiseazaRugaciuneaZilei();
  initNavMobil();
  initPWA();
  initFAQ();
  actualizeazaDataOra();
});

// ─── Supabase: Încarcă date pentru ziua de azi ────────────────────────────────
async function incarcaDateSupabase() {
  try {
    const azi = new Date();
    const dataStr = azi.toISOString().split('T')[0]; // YYYY-MM-DD

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/zile_ortodoxe?data=eq.${dataStr}&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = await response.json();

    if (rows && rows.length > 0) {
      supabaseData = rows[0];
      console.log('✅ Date Supabase încărcate:', supabaseData.sfant_nume);
    } else {
      console.log('ℹ️  Nu există date Supabase pentru azi — folosesc fallback');
    }
  } catch (e) {
    console.warn('⚠️  Supabase indisponibil, folosesc fallback:', e.message);
  }
}

// ─── Funcție helper: obține date pentru azi (Supabase sau fallback) ───────────
function getDateAzi() {
  if (supabaseData) return supabaseData;
  const azi = new Date();
  const sfantData = getSfantPentruData(azi);
  return {
    sfant_nume: sfantData?.sfant || 'Sfântul zilei',
    tip_post: sfantData?.post || 'dezlegare',
    culoare_liturgica: sfantData?.culoare || 'alb',
    rugaciunea_zilei: null,
    apostol_carte: null,
    apostol_versete: null,
    apostol_text: null,
    evanghelie_carte: null,
    evanghelie_versete: null,
    evanghelie_text: null,
    sinaxar: null,
    predica: null,
    cuvant_folos: null,
    tropar: null
  };
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

// ─── Helper date ──────────────────────────────────────────────────────────────
function getAzi() { return new Date(); }

function formatDataKey(data) {
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const z = String(data.getDate()).padStart(2, '0');
  const an = data.getFullYear();
  return `${an}-${m}-${z}`;
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
  const zilePost = [3, 5];
  const ziSapt = data.getDay();
  const estePost = zilePost.includes(ziSapt);
  return { sfant: 'Sfântul zilei', post: estePost ? 'post' : 'dezlegare', culoare: 'verde' };
}

function getTextPost(tipPost) {
  const texte = {
    'post': '🕯️ Zi de post',
    'post_strict': '🕯️ Post negru',
    'dezlegare': '✅ Dezlegare deplină',
    'dezlegare_peste': '🐟 Dezlegare la pește',
    'dezlegare_vin_ulei': '🍷 Dezlegare la vin și untdelemn'
  };
  return texte[tipPost] || '✅ Dezlegare';
}

function getBadgeClass(tipPost) {
  if (tipPost === 'dezlegare') return 'dezlegare';
  if (tipPost === 'dezlegare_peste') return 'dezlegare_peste';
  if (tipPost === 'post_strict') return 'post_strict';
  return 'post';
}

// ─── Sfântul Zilei ────────────────────────────────────────────────────────────
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
  if (sfantNumeEl) sfantNumeEl.textContent = date.sfant_nume;
  if (sfantScurtEl) {
    sfantScurtEl.textContent = date.sinaxar
      ? date.sinaxar.substring(0, 120) + '...'
      : `Prăznuit în calendarul ortodox pe ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]}.`;
  }
  if (badgePostEl) {
    badgePostEl.textContent = getTextPost(date.tip_post);
    badgePostEl.className = `badge-post ${getBadgeClass(date.tip_post)}`;
  }
  if (postTextEl) postTextEl.textContent = getTextPost(date.tip_post);

  document.title = `${date.sfant_nume} — ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()} | Povești de Credință`;
}

// ─── Apostolul Zilei (secțiune homepage) ─────────────────────────────────────
function afiseazaApostolulZilei() {
  const date = getDateAzi();
  const sectiune = document.getElementById('apostolul-zilei');
  if (!sectiune) return;

  if (date.apostol_carte && date.apostol_text) {
    const carteVersetEl = document.getElementById('apostol-carte-versete');
    const textEl = document.getElementById('apostol-text');
    if (carteVersetEl) carteVersetEl.textContent = `${date.apostol_carte} ${date.apostol_versete}`;
    if (textEl) textEl.textContent = date.apostol_text.substring(0, 300) + '...';
    sectiune.style.display = 'block';
  } else {
    sectiune.style.display = 'none';
  }
}

// ─── Evanghelia Zilei (secțiune homepage) ────────────────────────────────────
function afiseazaEvanghelia() {
  const date = getDateAzi();
  const sectiune = document.getElementById('evanghelia-zilei');
  if (!sectiune) return;

  if (date.evanghelie_carte && date.evanghelie_text) {
    const carteVersetEl = document.getElementById('evanghelie-carte-versete');
    const textEl = document.getElementById('evanghelie-text');
    if (carteVersetEl) carteVersetEl.textContent = `${date.evanghelie_carte} ${date.evanghelie_versete}`;
    if (textEl) textEl.textContent = date.evanghelie_text.substring(0, 300) + '...';
    sectiune.style.display = 'block';
  } else {
    sectiune.style.display = 'none';
  }
}

// ─── Sinaxarul Zilei (secțiune homepage) ─────────────────────────────────────
function afiseazaSinaxarul() {
  const date = getDateAzi();
  const sectiune = document.getElementById('sinaxarul-zilei');
  if (!sectiune) return;

  if (date.sinaxar) {
    const textEl = document.getElementById('sinaxar-text');
    if (textEl) textEl.textContent = date.sinaxar.substring(0, 250) + '...';
    sectiune.style.display = 'block';
  } else {
    sectiune.style.display = 'none';
  }
}

// ─── Predica Zilei (secțiune homepage) ───────────────────────────────────────
function afiseazaPredicaZilei() {
  const date = getDateAzi();
  const sectiune = document.getElementById('predica-zilei-home');
  if (!sectiune) return;

  if (date.predica) {
    const textEl = document.getElementById('predica-text');
    if (textEl) textEl.textContent = date.predica.substring(0, 200) + '...';
    sectiune.style.display = 'block';
  } else {
    sectiune.style.display = 'none';
  }
}

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
  startZi = (startZi + 6) % 7; // Convertim la Luni=0

  let html = '';

  const lunaPrec = new Date(an, luna, 0);
  for (let i = startZi - 1; i >= 0; i--) {
    const zi = lunaPrec.getDate() - i;
    html += `<div class="calendar-zi alta-luna"><span class="zi-nr">${zi}</span></div>`;
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
    const sfantScurt = sfantNume.replace('Sfântul ', 'Sf. ').replace('Sfânta ', 'Sf. ').split(';')[0];

    html += `
      <div class="${clase}" onclick="deschideModalZi(${zi}, ${luna}, ${an})">
        <span class="zi-nr">${zi}</span>
        <span class="zi-sfant">${sfantScurt}</span>
      </div>`;
  }

  const totalCelule = Math.ceil((startZi + ultimaZi.getDate()) / 7) * 7;
  const zileRamase = totalCelule - startZi - ultimaZi.getDate();
  for (let zi = 1; zi <= zileRamase; zi++) {
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

// ─── Modal zi ─────────────────────────────────────────────────────────────────
function deschideModalZi(zi, luna, an) {
  const data = new Date(an, luna, zi);
  const sfantData = getSfantPentruData(data);
  const modal = document.getElementById('modal-zi');
  if (!modal) return;

  const ziSapt = ZILE_LUNGI[data.getDay()];
  document.getElementById('modal-data').textContent =
    `${ziSapt}, ${zi} ${LUNI_GENITIV[luna]} ${an}`;

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

  for (const [cheie, post] of Object.entries(posturi)) {
    const startPost = new Date(post.start);
    const endPost = new Date(post.end);

    if (startPost > azi) {
      const diff = Math.ceil((startPost - azi) / (1000 * 60 * 60 * 24));
      if (diff < zileRamase) {
        zileRamase = diff;
        postUrmator = { ...post, cheie, inProgress: false };
      }
    } else if (azi >= startPost && azi <= endPost) {
      const diff = Math.ceil((endPost - azi) / (1000 * 60 * 60 * 24));
      postUrmator = { ...post, cheie, inProgress: true, zileRamase: diff };
      zileRamase = -1;
      break;
    }
  }

  if (!postUrmator) return;
  const el = document.getElementById('card-post-info');
  if (!el) return;

  if (postUrmator.inProgress) {
    el.innerHTML = `
      <div class="card-post-label">⛪ Post în desfășurare</div>
      <div class="card-post-titlu">${postUrmator.nume}</div>
      <div class="card-post-info">Se termină pe ${new Date(postUrmator.end).toLocaleDateString('ro-RO', {day:'numeric',month:'long'})}</div>
      <span class="card-post-countdown">Mai sunt ${postUrmator.zileRamase} zile</span>
    `;
  } else {
    const startFormatat = new Date(postUrmator.start).toLocaleDateString('ro-RO', {day:'numeric',month:'long'});
    el.innerHTML = `
      <div class="card-post-label">🕯️ Următorul post</div>
      <div class="card-post-titlu">${postUrmator.nume}</div>
      <div class="card-post-info">Începe pe ${startFormatat}</div>
      <span class="card-post-countdown">Peste ${zileRamase} zile</span>
    `;
  }
}

// ─── Rugăciunea zilei ─────────────────────────────────────────────────────────
const rugaciuni = [
  { titlu: "Rugăciunea dimineții", text: "Doamne Iisuse Hristoase, Fiul lui Dumnezeu, pentru rugăciunile Preacuratei Maicii Tale, ale Sfinților Părinților noștri și ale tuturor Sfinților, miluiește-mă pe mine, păcătosul. Amin." },
  { titlu: "Rugăciunea lui Iisus", text: "Doamne Iisuse Hristoase, Fiul lui Dumnezeu, miluiește-mă pe mine, păcătosul." },
  { titlu: "Rugăciunea Tatăl Nostru", text: "Tatăl nostru, Care ești în ceruri, sfințească-Se numele Tău, vie împărăția Ta, facă-Se voia Ta, precum în cer, așa și pe pământ. Pâinea noastră cea de toate zilele dă-ne-o nouă astăzi și ne iartă nouă greșalele noastre, precum și noi iertăm greșiților noștri. Și nu ne duce pe noi în ispită, ci ne izbăvește de cel rău. Amin." },
  { titlu: "Rugăciunea către Maica Domnului", text: "Născătoare de Dumnezeu, Fecioară, bucură-te, Marie, cea plină de har, Domnul este cu tine. Binecuvântată ești tu între femei și binecuvântat este rodul pântecelui tău, că ai născut pe Mântuitorul sufletelor noastre." },
  { titlu: "Rugăciunea de mulțumire", text: "Mulțumesc Ție, Doamne Dumnezeul meu, că m-ai păzit în această noapte. Dăruiește-mi putere să împlinesc în această zi poruncile Tale și să mă feresc de tot păcatul. Amin." },
  { titlu: "Rugăciunea pentru pace", text: "Doamne, dă-ne pace și liniște în suflet, în casă și în neamul nostru. Fii cu noi în toate zilele și ne călăuzește pe calea mântuirii. Amin." },
  { titlu: "Rugăciunea serii", text: "Doamne, Dumnezeul nostru, care ai iertat pe Petru Apostolul și pe femeia păcătoasă, nu trece cu vederea suspinul meu, ci miluiește-mă și mă mântuiește ca un iubitor de oameni. Amin." }
];

function afiseazaRugaciuneaZilei() {
  const azi = getAzi();
  const date = getDateAzi();

  // Folosește rugăciunea din Supabase dacă există, altfel fallback local
  const rugaciuneText = date.rugaciunea_zilei || rugaciuni[azi.getDay()].text;
  const rugaciuneTitlu = date.rugaciunea_zilei ? `Rugăciunea zilei de ${LUNI_GENITIV[azi.getMonth()]}` : rugaciuni[azi.getDay()].titlu;

  const titluEl = document.getElementById('rugaciune-titlu');
  const textEl = document.getElementById('rugaciune-text');

  if (titluEl) titluEl.textContent = rugaciuneTitlu;
  if (textEl) textEl.textContent = rugaciuneText;
}

function copieRugaciune() {
  const textEl = document.getElementById('rugaciune-text');
  if (!textEl) return;
  navigator.clipboard.writeText(textEl.textContent).then(() => {
    aratToast('✅ Rugăciunea a fost copiată!');
  }).catch(() => {
    aratToast('Selectează și copiază manual');
  });
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
    if (banner) banner.style.display = 'flex';
  });
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('pwa-banner');
    if (banner) banner.style.display = 'none';
    deferredPrompt = null;
    aratToast('🙏 Aplicația a fost instalată cu succes!');
  });
}

async function instaleazaPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (result.outcome === 'accepted') {
    aratToast('🙏 Mulțumim că ai instalat aplicația!');
  }
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
  const azi = getAzi();
  el.textContent = azi.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  setTimeout(actualizeazaDataOra, 60000);
}

// ─── Share WhatsApp ───────────────────────────────────────────────────────────
function shareWhatsApp(text) {
  const url = encodeURIComponent(text + '\n\npovestidecredinta.ro');
  window.open(`https://wa.me/?text=${url}`, '_blank');
}

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
