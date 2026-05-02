// ============================================
// POVEȘTI DE CREDINȚĂ — JavaScript Principal
// ============================================

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
               'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
const ZILE_SAPTAMANA = ['Dum','Lun','Mar','Mie','Joi','Vin','Sâm'];
const LUNI_GENITIV = ['ianuarie','februarie','martie','aprilie','mai','iunie',
                       'iulie','august','septembrie','octombrie','noiembrie','decembrie'];

let calendarData = null;
let lunaAfisata = new Date().getMonth();
let anAfisat = new Date().getFullYear();
let deferredPrompt = null;

// === INIȚIALIZARE ===
document.addEventListener('DOMContentLoaded', async () => {
  await incarcaDate();
  afiseazaSfantulZilei();
  randeazaCalendar(lunaAfisata, anAfisat);
  afiseazaPostUrmator();
  afiseazaRugaciuneaZilei();
  initNavMobil();
  initPWA();
  initFAQ();
  actualizeazaDataOra();
});

// === ÎNCARCĂ DATE CALENDAR ===
async function incarcaDate() {
  try {
    const r = await fetch('data/calendar.json');
    calendarData = await r.json();
  } catch(e) {
    console.error('Eroare la încărcarea datelor:', e);
    calendarData = { "2026": {}, "posturi": {}, "sarbatori_mari": {} };
  }
}

// === HELPER DATE ===
function getAzi() {
  return new Date();
}

function formatDataKey(data) {
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const z = String(data.getDate()).padStart(2, '0');
  const an = data.getFullYear();
  return `${an}-${m}-${z}`;
}

function formatDataKeyMZ(luna, zi) {
  return `${String(luna + 1).padStart(2,'0')}-${String(zi).padStart(2,'0')}`;
}

function getSfantPentruData(data) {
  if (!calendarData) return null;
  const cheie = formatDataKey(data);
  const an = String(data.getFullYear());
  // Caută mai întâi după an complet, apoi după lună-zi
  if (calendarData[an] && calendarData[an][cheie]) return calendarData[an][cheie];
  const mz = `${String(data.getMonth()+1).padStart(2,'0')}-${String(data.getDate()).padStart(2,'0')}`;
  if (calendarData[an]) {
    for (const key of Object.keys(calendarData[an])) {
      if (key.endsWith(mz)) return calendarData[an][key];
    }
  }
  // Default pentru zilele fără date specifice
  const zilePost = [3, 5]; // Miercuri=3, Vineri=5
  const ziSapt = data.getDay();
  const estePost = zilePost.includes(ziSapt);
  return {
    sfant: 'Sfântul zilei',
    post: estePost ? 'post' : 'dezlegare',
    culoare: 'verde'
  };
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

// === SFÂNTUL ZILEI ===
function afiseazaSfantulZilei() {
  const azi = getAzi();
  const sfantData = getSfantPentruData(azi);
  if (!sfantData) return;

  const ziSaptEl = document.getElementById('zi-saptamana');
  const dataEl = document.getElementById('data-completa');
  const sfantNumeEl = document.getElementById('sfant-nume');
  const sfantScurtEl = document.getElementById('sfant-scurt');
  const badgePostEl = document.getElementById('badge-post');
  const postTextEl = document.getElementById('post-text');

  const ziSapt = ZILE_SAPTAMANA[azi.getDay()];
  const dataFormatata = `${ziSapt}, ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()}`;

  if (ziSaptEl) ziSaptEl.textContent = dataFormatata;
  if (dataEl) dataEl.textContent = dataFormatata;
  if (sfantNumeEl) sfantNumeEl.textContent = sfantData.sfant;
  if (sfantScurtEl) sfantScurtEl.textContent = `Prăznuit în calendarul ortodox pe ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]}.`;
  if (badgePostEl) {
    badgePostEl.textContent = getTextPost(sfantData.post);
    badgePostEl.className = `badge-post ${getBadgeClass(sfantData.post)}`;
  }
  if (postTextEl) postTextEl.textContent = getTextPost(sfantData.post);

  document.title = `${sfantData.sfant} — ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]} ${azi.getFullYear()} | Povești de Credință`;
}

// === CALENDAR ===
function randeazaCalendar(luna, an) {
  const container = document.getElementById('calendar-grid');
  const titluEl = document.getElementById('calendar-titlu');
  if (!container) return;

  if (titluEl) titluEl.textContent = `${LUNI[luna]} ${an}`;

  const primaZi = new Date(an, luna, 1);
  const ultimaZi = new Date(an, luna + 1, 0);
  const azi = getAzi();

  let startZi = primaZi.getDay(); // 0=Dum
  // Convertim la Luni=0
  startZi = (startZi + 6) % 7;

  let html = '';

  // Zile din luna precedentă
  const lunaPrec = new Date(an, luna, 0);
  for (let i = startZi - 1; i >= 0; i--) {
    const zi = lunaPrec.getDate() - i;
    html += `<div class="calendar-zi alta-luna"><span class="zi-nr">${zi}</span></div>`;
  }

  // Zilele lunii curente
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

  // Completăm cu zile din luna următoare
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

// === MODAL ZI ===
function deschideModalZi(zi, luna, an) {
  const data = new Date(an, luna, zi);
  const sfantData = getSfantPentruData(data);
  const modal = document.getElementById('modal-zi');
  
  if (!modal) return;

  const ziSapt = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'][data.getDay()];
  
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

// === POST URMĂTOR ===
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

// === RUGĂCIUNEA ZILEI ===
const rugaciuni = [
  {
    titlu: "Rugăciunea dimineții",
    text: "Doamne Iisuse Hristoase, Fiul lui Dumnezeu, pentru rugăciunile Preacuratei Maicii Tale, ale Sfinților Părinților noștri și ale tuturor Sfinților, miluiește-mă pe mine, păcătosul. Amin."
  },
  {
    titlu: "Rugăciunea lui Iisus",
    text: "Doamne Iisuse Hristoase, Fiul lui Dumnezeu, miluiește-mă pe mine, păcătosul."
  },
  {
    titlu: "Rugăciunea Tatăl Nostru",
    text: "Tatăl nostru, Care ești în ceruri, sfințească-Se numele Tău, vie împărăția Ta, facă-Se voia Ta, precum în cer, așa și pe pământ. Pâinea noastră cea de toate zilele dă-ne-o nouă astăzi și ne iartă nouă greșalele noastre, precum și noi iertăm greșiților noștri. Și nu ne duce pe noi în ispită, ci ne izbăvește de cel rău. Amin."
  },
  {
    titlu: "Rugăciunea către Maica Domnului",
    text: "Născătoare de Dumnezeu, Fecioară, bucură-te, Marie, cea plină de har, Domnul este cu tine. Binecuvântată ești tu între femei și binecuvântat este rodul pântecelui tău, că ai născut pe Mântuitorul sufletelor noastre."
  },
  {
    titlu: "Rugăciunea de mulțumire",
    text: "Mulțumesc Ție, Doamne Dumnezeul meu, că m-ai păzit în această noapte. Dăruiește-mi putere să împlinesc în această zi poruncile Tale și să mă feresc de tot păcatul. Amin."
  },
  {
    titlu: "Rugăciunea pentru pace",
    text: "Doamne, dă-ne pace și liniște în suflet, în casă și în neamul nostru. Fii cu noi în toate zilele și ne călăuzește pe calea mântuirii. Amin."
  },
  {
    titlu: "Rugăciunea serii",
    text: "Doamne, Dumnezeul nostru, care ai iertat pe Petru Apostolul și pe femeia păcătoasă, nu trece cu vederea suspinul meu, ci miluiește-mă și mă mântuiește ca un iubitor de oameni. Amin."
  }
];

function afiseazaRugaciuneaZilei() {
  const azi = getAzi();
  const index = azi.getDay(); // 0-6, una pe zi din săptămână
  const rugaciune = rugaciuni[index];
  
  const titluEl = document.getElementById('rugaciune-titlu');
  const textEl = document.getElementById('rugaciune-text');
  
  if (titluEl) titluEl.textContent = rugaciune.titlu;
  if (textEl) textEl.textContent = rugaciune.text;
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

// === NAVIGAȚIE MOBILĂ ===
function initNavMobil() {
  const hamburger = document.getElementById('hamburger');
  const navMobil = document.getElementById('nav-mobil');
  
  if (hamburger && navMobil) {
    hamburger.addEventListener('click', () => {
      navMobil.classList.toggle('deschis');
    });
  }
}

// === SCHIMBĂ PAGINA (SPA-like pentru bottom nav) ===
function aratPagina(pagina) {
  document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('activ'));
  
  const el = document.getElementById(`pagina-${pagina}`);
  if (el) el.style.display = 'block';
  
  const navEl = document.querySelector(`[data-pagina="${pagina}"]`);
  if (navEl) navEl.classList.add('activ');

  // Re-randăm calendarul dacă e nevoie
  if (pagina === 'calendar') {
    randeazaCalendar(lunaAfisata, anAfisat);
  }

  window.scrollTo(0, 0);
}

// === FAQ ===
function initFAQ() {
  document.querySelectorAll('.faq-intrebare').forEach(el => {
    el.addEventListener('click', () => {
      const item = el.parentElement;
      item.classList.toggle('deschis');
    });
  });
}

// === PWA ===
function initPWA() {
  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Install prompt
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

// === TOAST ===
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

// === ACTUALIZARE DATĂ/ORA ===
function actualizeazaDataOra() {
  const el = document.getElementById('data-ora-live');
  if (!el) return;
  
  const azi = getAzi();
  el.textContent = azi.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  setTimeout(actualizeazaDataOra, 60000);
}

// === SHARE WHATSAPP ===
function shareWhatsApp(text) {
  const url = encodeURIComponent(text + '\n\npovestidecredinta.ro');
  window.open(`https://wa.me/?text=${url}`, '_blank');
}

// Expunem funcțiile globale
window.navigheazaCalendar = navigheazaCalendar;
window.deschideModalZi = deschideModalZi;
window.inchideModal = inchideModal;
window.instaleazaPWA = instaleazaPWA;
window.copieRugaciune = copieRugaciune;
window.aratPagina = aratPagina;
window.shareWhatsApp = shareWhatsApp;
