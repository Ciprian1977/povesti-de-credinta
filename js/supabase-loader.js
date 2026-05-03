/**
 * supabase-loader.js
 * Povești de Credință — povestidecredinta.ro
 * 
 * Modul comun pentru încărcarea datelor din Supabase pe paginile individuale.
 * Folosit de: sfantul-zilei, apostolul-zilei, evanghelia-zilei, sinaxarul-zilei,
 *             predica-zilei, calendar-ortodox-azi
 */

const SUPABASE_URL = 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk';

const LUNI_GENITIV = ['ianuarie','februarie','martie','aprilie','mai','iunie',
                       'iulie','august','septembrie','octombrie','noiembrie','decembrie'];
const ZILE_LUNGI = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];

/**
 * Obține datele din Supabase pentru o dată specifică
 * @param {string} dataStr - Format YYYY-MM-DD (implicit: azi)
 * @returns {Object|null} - Datele din Supabase sau null
 */
async function incarcaDateSupabase(dataStr = null) {
  if (!dataStr) {
    const azi = new Date();
    dataStr = azi.toISOString().split('T')[0];
  }

  try {
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
    return (rows && rows.length > 0) ? rows[0] : null;
  } catch (e) {
    console.warn('⚠️  Supabase indisponibil:', e.message);
    return null;
  }
}

/**
 * Formatează data în română
 */
function formateazaData(dataStr) {
  const d = new Date(dataStr);
  const zi = ZILE_LUNGI[d.getDay()];
  return `${zi}, ${d.getDate()} ${LUNI_GENITIV[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Obține textul tipului de post
 */
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

/**
 * Copiază text în clipboard cu toast
 */
function copieText(text, mesaj = '✅ Text copiat!') {
  navigator.clipboard.writeText(text).then(() => {
    aratToast(mesaj);
  }).catch(() => {
    // Fallback pentru browsere vechi
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    aratToast(mesaj);
  });
}

/**
 * Share WhatsApp
 */
function shareWhatsApp(text) {
  const url = encodeURIComponent(text + '\n\n✝️ povestidecredinta.ro');
  window.open(`https://wa.me/?text=${url}`, '_blank');
}

/**
 * Toast notification
 */
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

/**
 * Actualizează Schema.org Person pentru sfânt
 */
function actualizeazaSchemaPersoana(date) {
  const schemaEl = document.getElementById('schema-person');
  if (!schemaEl || !date) return;

  const azi = new Date();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": date.sfant_nume,
    "description": date.sfant_viata ? date.sfant_viata.substring(0, 200) : `Sfânt ortodox prăznuit pe ${azi.getDate()} ${LUNI_GENITIV[azi.getMonth()]}`,
    "knowsAbout": "Ortodoxie, Credință creștină",
    "memberOf": {
      "@type": "Organization",
      "name": "Biserica Ortodoxă Română"
    }
  };
  schemaEl.textContent = JSON.stringify(schema);
}

/**
 * Actualizează Schema.org FAQPage
 */
function actualizeazaSchemaFAQ(intrebari) {
  const schemaEl = document.getElementById('schema-faq');
  if (!schemaEl || !intrebari || intrebari.length === 0) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": intrebari.map(q => ({
      "@type": "Question",
      "name": q.intrebare,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.raspuns
      }
    }))
  };
  schemaEl.textContent = JSON.stringify(schema);
}

/**
 * Inițializează FAQ accordion
 */
function initFAQ() {
  document.querySelectorAll('.faq-intrebare').forEach(el => {
    el.addEventListener('click', () => {
      const item = el.parentElement;
      const esteOpen = item.classList.contains('deschis');
      // Închide toate
      document.querySelectorAll('.faq-item.deschis').forEach(i => i.classList.remove('deschis'));
      // Deschide pe cel curent dacă era închis
      if (!esteOpen) item.classList.add('deschis');
    });
  });
}

/**
 * Inițializează navigația mobilă (hamburger)
 */
function initNavMobil() {
  const hamburger = document.getElementById('hamburger');
  const navMobil = document.getElementById('nav-mobil');
  if (hamburger && navMobil) {
    hamburger.addEventListener('click', () => {
      navMobil.classList.toggle('deschis');
    });
    // Închide la click în afară
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMobil.contains(e.target)) {
        navMobil.classList.remove('deschis');
      }
    });
  }
}

// Expune global
window.copieText = copieText;
window.shareWhatsApp = shareWhatsApp;
window.aratToast = aratToast;
window.initFAQ = initFAQ;
window.initNavMobil = initNavMobil;
