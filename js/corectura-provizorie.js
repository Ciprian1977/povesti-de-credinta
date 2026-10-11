/* corectura-provizorie.js — măsuri provizorii până la modulul de calendar BOR validat.
 *
 * Se încarcă PRIMUL în <head> pe toate paginile (fără defer), înaintea oricărui alt script.
 * Ce face:
 *  1. Datele zilei venite din Supabase (tabelul zile_ortodoxe) sunt curățate ÎN BROWSER,
 *     înainte să ajungă la paginile sitului: fără eticheta de post, fără „cuvântul de folos”,
 *     fără textul integral al Apostolului și al Evangheliei. Baza de date NU se modifică.
 *  2. Elementele care afișau aceste informații sunt ascunse.
 *  3. În locul textului integral apare referința biblică + link către lectura publicată pe Doxologia.
 *  4. Pentru 1 octombrie – 31 decembrie 2026, sfinții afișați vin din calendarul validat (data/calendar-validat-2026-t4.json).
 *
 * Pentru a anula măsura: se scoate acest fișier din pagini (sau PDC_CORECTURA.activ = false).
 */
(function () {
  var C = window.PDC_CORECTURA = { activ: true };
  var LUNI = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  var CAMPURI_ASCUNSE = ['apostol_text', 'evanghelie_text', 'cuvant_folos', 'tip_post', 'post_info'];

  // ── 1. Filtrarea datelor la sursă (fetch) ──────────────────────────────────
  function curata(rand) {
    if (rand && typeof rand === 'object') {
      CAMPURI_ASCUNSE.forEach(function (k) { if (k in rand) rand[k] = null; });
      // descrierea SEO generată poate menționa postul sau „textul integral” → paginile își folosesc descrierea proprie
      if (rand.meta_description && /post|dezleg|har[țt]i|integral|complet/i.test(rand.meta_description)) rand.meta_description = null;
    }
    return rand;
  }
  // ── 1b. Calendarul validat octombrie–decembrie 2026 (din calendarul tipărit fotografiat) ──
  // Are prioritate la afișare față de numele din Supabase și față de calendarul static vechi.
  // Supabase NU se modifică; generarea zilnică NU este atinsă.
  var fetchOriginal = window.fetch ? window.fetch.bind(window) : null;
  var URL_VALIDAT = '/data/calendar-validat-2026-t4.json?v=1';
  var pValidat = null;
  function calendarValidat() {
    if (!pValidat) {
      pValidat = fetchOriginal ? fetchOriginal(URL_VALIDAT).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { return (j && j.zile) || {}; }).catch(function () { return {}; }) : Promise.resolve({});
    }
    return pValidat;
  }
  function numeValidat(z) { return z.sfinti + (z.duminica ? '; ' + z.duminica : ''); }
  window.pdcCalendarValidat = calendarValidat;
  window.pdcNumeValidat = numeValidat;
  // Textele generate zilnic (viața, troparul, condacul, sinaxarul) care vorbesc despre sfinți ce NU sunt în calendarul validat
  // nu se afișează; în locul lor apare un mesaj neutru. Nu se inventează nimic, baza de date nu se modifică.
  var TITLURI = /^(sfant|sfanta|sfantul|sfintii|sfintei|sfintilor|sfantului|sfintit|sfintiti|sfintitul|mucenic|mucenicul|mucenici|mucenica|mucenita|mucenitele|mare|marele|mari|marii|nou|noul|noi|cuvios|cuviosul|cuvioasa|cuviosi|cuvioasele|ierarh|ierarhul|ierarhi|apostol|apostolul|apostoli|apostolilor|prooroc|proorocul|proroc|prorocul|preot|preotul|diacon|diaconul|marturisitor|marturisitorul|episcop|episcopul|arhiepiscop|arhiepiscopul|mitropolit|mitropolitul|patriarh|patriarhul|arhanghel|arhanghelul|arhangheli|arhanghelii|imparat|imparatul|imparati|imparatii|imparateasa|cinstirea|icoane|icoanei|icoana|acatist|maicii|domnului|maica|soborul|duminica|rusalii|biserica|bisericii|ortodoxa|ortodoxe|parinti|parintilor|stareti|staretilor|aducerea|moastelor|pomenirea|praznuirea|dupa|pilda|semanatorului|sinodul|ecumenic|lea|manastirea|manastirii|lavra|constantinopolului|constantinopol|ierusalimului|ierusalim|alexandriei|antiohiei|romei|niceei|rusiei|romaniei)$/;
  function fd(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  // Pomenirile din baza de date care NU sunt în calendarul validat. O pomenire e „străină” doar dacă NICIUNUL dintre numele ei
  // nu apare în calendarul validat (cu toleranță la grafie: aceleași primele 5 litere), ca să nu fie ascunse texte corecte
  // scrise cu o denumire alternativă a aceluiași sfânt. Duminicile au denumiri variabile și nu se compară.
  function pomeniriStraine(numeDb, z) {
    var valid = fd(z.sfinti + ' ' + (z.duminica || '')).split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4; });
    var ECHIV = { dumitru: 'dimitrie', dimitrie: 'dumitru', hrisostom: 'gura', nicolai: 'nicolae', iacov: 'iacob', feodor: 'teodor' };
    function dist(x, y) { // distanța de editare (câte litere diferă)
      var d = []; for (var i = 0; i <= x.length; i++) { d[i] = [i]; for (var j = 1; j <= y.length; j++) d[i][j] = i ? Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1)) : j; }
      return d[x.length][y.length];
    }
    function apare(w) {
      return valid.some(function (v) {
        return v === w || ECHIV[w] === v || (w.length >= 5 && v.length >= 5 && v.slice(0, 5) === w.slice(0, 5)) ||
          (Math.min(v.length, w.length) >= 5 && dist(v, w) <= (Math.min(v.length, w.length) >= 7 ? 2 : 1));
      });
    }
    return String(numeDb || '').split(';').map(function (p) {
      if (/duminica|rusalii|nasterea domnului|craciun/.test(fd(p))) return [];
      var nume = (p.match(/[A-ZĂÂÎȘŞȚŢ][^\s;,.()„”"'’–-]{3,}/g) || []).map(fd).filter(function (w) { return !TITLURI.test(w); });
      return nume.some(apare) ? [] : nume.filter(function (w, i) { return nume.indexOf(w) === i; });
    }).filter(function (k) { return k.length; });
  }
  // Un text e ascuns doar dacă numește clar o pomenire străină: toate numele ei, sau cel puțin două dintre ele.
  function numesteStrain(text, straine) {
    var t = fd(text);
    return straine.some(function (k) { var n = k.filter(function (w) { return t.indexOf(w) !== -1; }).length; return n >= Math.min(2, k.length); });
  }
  // Predica (despre Evanghelie, cu citate din Sfinții Părinți) nu se filtrează.
  var NEUTRU = { sfant_viata: 'Viața sfântului zilei nu este disponibilă momentan.', sinaxar: 'Sinaxarul zilei nu este disponibil momentan.',
                 tropar: 'Troparul nu este disponibil momentan.', condac: 'Condacul nu este disponibil momentan.' };
  function aplicaValidat(rand, V) {
    var z = rand && typeof rand === 'object' && rand.data_calendaristica && V[rand.data_calendaristica];
    if (!z) return;
    var straine = pomeniriStraine(rand.sfant_nume, z);
    if (straine.length) Object.keys(NEUTRU).forEach(function (k) {
      if (typeof rand[k] === 'string' && numesteStrain(rand[k], straine)) rand[k] = NEUTRU[k];
    });
    if ('sfant_nume' in rand) rand.sfant_nume = numeValidat(z);
    if ('sfinti_secundari' in rand) rand.sfinti_secundari = null;
    if ('meta_description' in rand) {
      var p = rand.data_calendaristica.split('-');
      var m = 'Calendar ortodox ' + (+p[2]) + ' ' + LUNI[+p[1] - 1] + ' ' + p[0] + ': ' + numeValidat(z);
      rand.meta_description = m.length > 158 ? m.slice(0, 155).replace(/[\s;,]+\S*$/, '') + '…' : m;
    }
  }

  if (fetchOriginal) {
    window.fetch = function (resursa, opt) {
      var url = typeof resursa === 'string' ? resursa : (resursa && resursa.url) || '';
      var p = fetchOriginal(resursa, opt);
      var esteZile = url.indexOf('/rest/v1/zile_ortodoxe') !== -1;
      var esteCalendarStatic = /\/data\/calendar\.json(\?|$)/.test(url);
      if (!C.activ || (!esteZile && !esteCalendarStatic)) return p;
      return p.then(function (r) {
        if (!r || !r.ok) return r;
        return Promise.all([r.clone().json(), calendarValidat()]).then(function (x) {
          var d = x[0], V = x[1];
          if (esteZile) {
            (Array.isArray(d) ? d : [d]).forEach(function (rand) { curata(rand); aplicaValidat(rand, V); });
          } else if (d && typeof d === 'object') {
            // calendarul static vechi (fallback): zilele validate îl înlocuiesc, fără etichete de post
            Object.keys(V).forEach(function (iso) {
              var an = iso.slice(0, 4); d[an] = d[an] || {};
              d[an][iso.slice(5)] = { sfant: numeValidat(V[iso]), post: '', culoare: '' };
            });
          }
          return new Response(JSON.stringify(d), { status: r.status, statusText: r.statusText, headers: r.headers });
        }).catch(function () { return r; });
      });
    };
  }

  // ── 2. Ascunderea elementelor ──────────────────────────────────────────────
  var css =
    '#badge-post,#sfintii-post,#post-badge,#post-info,#post-text,.badge-post,.cal-post,.badge-post-zi,' +
    '[aria-labelledby="titlu-cuvant-folos"],#card-cuvant-folos,.sectiune-cuvant-folos,#cuvant-folos-text,' +
    'button[onclick^="copiazaApostol"],button[onclick^="copiazaEvanghelia"],#btn-copie-apostol,#btn-copie-evanghelie,' +
    '[data-faq-post],div:has(> #talcuire-text){display:none!important}' +
    '.cal-marcaj{display:inline-block;margin-top:4px;padding:2px 8px;border-radius:10px;font-size:.78rem;background:rgba(107,27,43,.08);color:var(--visineu,#6B1B2B)}' +
    '.cal-duminica-nume{display:block;margin-top:2px;font-size:.85rem;color:var(--text-medium,#555)}' +
    '.lectura-sursa{margin:4px 0 0;padding:16px 18px;border-radius:14px;background:#F4F6FB;color:#1a1a1a;font-style:normal;' +
    'font-family:Inter,system-ui,sans-serif;font-size:1.05rem;line-height:1.6}' +
    '.lectura-sursa p{margin:0 0 10px}' +
    '.lectura-sursa a.lectura-link{display:inline-block;padding:10px 16px;border-radius:999px;background:#002B7F;color:#fff;' +
    'text-decoration:none;font-weight:600}' +
    '.lectura-sursa a.lectura-link:focus-visible{outline:3px solid #FCD116;outline-offset:2px}' +
    '.lectura-sursa .lectura-nota{margin:10px 0 0;font-size:.92rem;color:#555}';
  var st = document.createElement('style');
  st.id = 'corectura-provizorie-css';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  // ── 3. Referință + link în locul textului integral ─────────────────────────
  function dataAzi() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bucharest', day: 'numeric', month: 'numeric' }).formatToParts(new Date());
      var z = +p.find(function (x) { return x.type === 'day'; }).value, l = +p.find(function (x) { return x.type === 'month'; }).value;
      return { zi: z, luna: l };
    } catch (e) { var d = new Date(); return { zi: d.getDate(), luna: d.getMonth() + 1 }; }
  }
  function linkSursa() {
    var d = dataAzi();
    return 'https://doxologia.ro/' + d.zi + '-' + LUNI[d.luna - 1];
  }
  function cutie(tip) {
    var numeLectura = tip === 'apostol' ? 'Apostolului' : 'Evangheliei';
    return '<div class="lectura-sursa" data-corectura="1">' +
      '<p>Referința biblică a ' + numeLectura + ' zilei este afișată mai sus. Lectura completă o puteți citi pe Doxologia.</p>' +
      '<a class="lectura-link" href="' + linkSursa() + '" target="_blank" rel="noopener">Citește lectura pe Doxologia ↗</a>' +
      '</div>';
  }
  window.pdcCutieLectura = cutie;

  var TINTE = [
    ['apostol-text-complet', 'apostol'], ['evanghelie-text-complet', 'evanghelie'],
    ['apostol-text', 'apostol'], ['evanghelie-text', 'evanghelie'], ['ev-text', 'evanghelie'],
    ['apostol-text-acasa', 'apostol'], ['evanghelie-text-acasa', 'evanghelie']
  ];
  function aplica() {
    if (!C.activ) return;
    TINTE.forEach(function (t) {
      document.querySelectorAll('#' + t[0]).forEach(function (el) {
        if (el.getAttribute('data-corectura') === '1' && el.querySelector('.lectura-sursa')) return;
        el.setAttribute('data-corectura', '1');
        el.innerHTML = cutie(t[1]);
      });
    });
    // Întrebările „Este post azi?” din secțiunile FAQ
    document.querySelectorAll('details, .faq-item, .faq-intrebare').forEach(function (el) {
      if (!el.hasAttribute('data-faq-post') && /Este post azi/i.test(el.textContent || '')) el.setAttribute('data-faq-post', '1');
    });
  }
  var programat = false;
  function programeaza() { if (programat) return; programat = true; setTimeout(function () { programat = false; aplica(); }, 0); }
  new MutationObserver(function (lista) {
    for (var i = 0; i < lista.length; i++) {
      var t = lista[i].target;
      var el = t.nodeType === 1 ? t : t.parentElement;
      if (el && el.closest && el.closest('.lectura-sursa')) continue;
      programeaza(); return;
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', aplica);

  // ── 4. Sfântul zilei, ieri și mâine pe paginile cu calendar static vechi (fallback) ──
  // Rulează după scripturile paginii, ca să nu rămână nume din calendarul static vechi.
  function isoRo(zile) {
    try {
      var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      var d = new Date(p + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + zile); return d.toISOString().slice(0, 10);
    } catch (e) { var x = new Date(); x.setDate(x.getDate() + zile); return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); }
  }
  function scurt(n, max) { var p = n.split(';')[0]; return p.length > max ? p.substring(0, max) + '...' : p; }
  function seteaza(sel, text) { var el = document.querySelector(sel); if (el && text) el.textContent = text; }
  // Titlul, descrierile (meta / Open Graph / Twitter), datele structurate (JSON-LD) și răspunsurile FAQ
  // construite de pagină din calendarul static vechi primesc numele validat.
  function inlocuiesteNumeVechi(n) {
    var cheie = isoRo(0).slice(5), vechi = [];
    document.querySelectorAll('script:not([src])').forEach(function (sc) {
      var m = new RegExp('"' + cheie + '"\\s*:\\s*\\{\\s*"?sfant"?\\s*:\\s*"([^"]+)"').exec(sc.textContent || '');
      if (m && vechi.indexOf(m[1]) === -1) vechi.push(m[1]);
    });
    vechi = vechi.filter(function (v) { return v && n.indexOf(v) === -1; });
    var perechi = vechi.map(function (v) { return [v, n]; })
      .concat([[': Sfinții zilei', ': ' + n], ['✝️ Sfinții zilei', '✝️ ' + n], ['este Sfinții zilei', 'este ' + n], ['prăznuit Sfinții zilei', 'prăznuit ' + n],
               ['Viața Sfinții zilei', 'Viața ' + n.split(';')[0].trim()], ['Sfânt din Sinaxarul BOR', n], ['Sfânt din Sinaxar', n]]);
    function inloc(t, json) {
      perechi.forEach(function (p) {
        var a = json ? JSON.stringify(p[0]).slice(1, -1) : p[0], b2 = json ? JSON.stringify(p[1]).slice(1, -1) : p[1];
        t = t.split(a).join(b2);
      });
      return t;
    }
    if (document.title) document.title = inloc(document.title);
    document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]').forEach(function (m) {
      var c = m.getAttribute('content'); if (c) { var x = inloc(c); if (x !== c) m.setAttribute('content', x); }
    });
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (sc) {
      var t = sc.textContent || '';
      var x = inloc(t, true).split('"name":"Sfinții zilei"').join('"name":' + JSON.stringify(n.split(';')[0].trim()));
      if (x !== t) sc.textContent = x;
    });
    document.querySelectorAll('#viata-text strong').forEach(function (el) {
      var t = (el.textContent || '').trim(); if (t === 'Sfinții zilei' || vechi.indexOf(t) !== -1) el.textContent = n;
    });
    document.querySelectorAll('[id^="faq"], #viata-titlu, #hero-h1').forEach(function (el) {
      if (el.children.length) return; var t = el.textContent || ''; var x = inloc(t); if (x !== t) el.textContent = x;
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (!C.activ) return;
    calendarValidat().then(function (V) {
      setTimeout(function () {
        var z = V[isoRo(0)], zi = V[isoRo(-1)], zm = V[isoRo(1)];
        if (z) {
          var n = numeValidat(z);
          seteaza('#sfant-azi', '✝️ ' + n);
          seteaza('#sfant-card', scurt(n, 50));
          seteaza('#sfant-principal', n);
        }
        if (zi) seteaza('#sfant-ieri', scurt(numeValidat(zi), 35));
        if (zm) seteaza('#sfant-maine', scurt(numeValidat(zm), 35));
        if (z) inlocuiesteNumeVechi(numeValidat(z));
      }, 0);
    });
  });
})();
