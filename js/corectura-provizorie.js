/* corectura-provizorie.js — măsuri provizorii până la modulul de calendar BOR validat.
 *
 * Se încarcă PRIMUL în <head> pe toate paginile (fără defer), înaintea oricărui alt script.
 * Ce face:
 *  1. Datele zilei venite din Supabase (tabelul zile_ortodoxe) sunt curățate ÎN BROWSER,
 *     înainte să ajungă la paginile sitului: fără eticheta de post, fără „cuvântul de folos”,
 *     fără textul integral al Apostolului și al Evangheliei. Baza de date NU se modifică.
 *  2. Elementele care afișau aceste informații sunt ascunse.
 *  3. În locul textului integral apare referința exactă + linkul către sursa oficială.
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
  if (window.fetch) {
    var fetchOriginal = window.fetch.bind(window);
    window.fetch = function (resursa, opt) {
      var url = typeof resursa === 'string' ? resursa : (resursa && resursa.url) || '';
      var p = fetchOriginal(resursa, opt);
      if (!C.activ || url.indexOf('/rest/v1/zile_ortodoxe') === -1) return p;
      return p.then(function (r) {
        if (!r || !r.ok) return r;
        return r.clone().json().then(function (d) {
          if (Array.isArray(d)) d.forEach(curata); else curata(d);
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
      '<p>Textul integral al ' + numeLectura + ' zilei îl puteți citi la sursa oficială, după referința de mai sus.</p>' +
      '<a class="lectura-link" href="' + linkSursa() + '" target="_blank" rel="noopener">Citește pe doxologia.ro ↗</a>' +
      '<p class="lectura-nota">doxologia.ro — portalul Mitropoliei Moldovei și Bucovinei (Biserica Ortodoxă Română)</p>' +
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
})();
