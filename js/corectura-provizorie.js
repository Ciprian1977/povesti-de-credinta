/* corectura-provizorie.js — măsuri provizorii până la modulul de calendar BOR validat.
 *
 * Se încarcă PRIMUL în <head> pe toate paginile (fără defer), înaintea oricărui alt script.
 * Ce face:
 *  1. Datele zilei venite din Supabase (tabelul zile_ortodoxe) sunt curățate ÎN BROWSER,
 *     înainte să ajungă la paginile sitului: fără eticheta de post, fără „cuvântul de folos”,
 *     fără textul integral al Apostolului și al Evangheliei. Baza de date NU se modifică.
 *  2. Elementele care afișau aceste informații sunt ascunse.
 *  3. În locul textului generat apare textul integral al Apostolului și Evangheliei din Biblia 1914 (Ediția Sfântului Sinod, domeniu public).
 *  4. Pentru 1 octombrie – 31 decembrie 2026, sfinții afișați vin din calendarul validat (data/calendar-validat-2026-t4.json).
 *
 * Pentru a anula măsura: se scoate acest fișier din pagini (sau PDC_CORECTURA.activ = false).
 */
(function () {
  var C = window.PDC_CORECTURA = { activ: true };
  // Datele zilei salvate pe telefon (localStorage, valabile toată ziua) au fost filtrate de versiunea de atunci a acestui
  // fișier. La o versiune nouă a corecturii, se șterg, ca pagina să ia din nou textul zilei, filtrat cu regulile noi.
  var VERSIUNE = '9';
  try {
    if (localStorage.getItem('pdc_corectura_v') !== VERSIUNE) {
      localStorage.removeItem('pdc_cache_v5');
      localStorage.setItem('pdc_corectura_v', VERSIUNE);
    }
  } catch (e) { /* localStorage indisponibil */ }
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
  var URL_VALIDAT = '/data/calendar-validat-2026-t4.json?v=2';
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
  // Textele generate zilnic (viața, troparul, condacul, sinaxarul, predica) care vorbesc despre sfinți ce NU sunt în calendarul validat
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
  // În predică, numele Sfinților Părinți citați des nu contează (ex. „Sfântul Ioan Gură de Aur spune…”).
  var PARINTI = /^(ioan|vasile|grigorie|ignatie|atanasie|chiril|maxim|efrem|isaac|serafim|paisie|teofan|nicolae|dumitru|ambrozie|augustin|siluan|porfirie|cleopa|arsenie|simeon|macarie|antonie|ieronim|teofil|nectarie|nicodim|iustin|filaret|dimitrie|marcu|petru|pavel|iacob|andrei|toma|luca|matei)$/;
  function numesteStrain(text, straine, predica) {
    var t = fd(text);
    return straine.some(function (k) {
      if (predica) k = k.filter(function (w) { return !PARINTI.test(w); });
      var n = k.filter(function (w) { return t.indexOf(w) !== -1; }).length; return k.length && n >= Math.min(2, k.length);
    });
  }
  // Predica și sinaxarul pomenesc de obicei sfinții greșiți doar în câteva propoziții: se scot doar acelea (și propoziția
  // următoare, dacă vorbește tot despre ei: „El…”, „Aceste icoane…”), plus propozițiile cu informații de post neverificate.
  // Dacă se scot prea multe propoziții sau rămâne prea puțin, textul nu se afișează (mesaj neutru).
  var CONTINUARE = /^(el|ea|ei|ele|acesta|aceasta|această|acest|aceste|acestea|aceștia|acești|viața (lui|ei|lor)|prin (el|ea|ei|viața))\b/i;
  // afirmații despre ziua respectivă care nu sunt verificate (post, dezlegări, culoare liturgică); „rugăciune, post și fapte bune” rămâne
  var POST = /\b(dezlegare|dezlegarea|dezlegări|dezlegări?le|harți|ajunare|frupt|de dulce|zi de post|zi cu post|zi fără post|tipul de post|postul (este|zilei|de azi|de astăzi)|se postește|se ține post|culoare(a)? (liturgic\w*|alb\w*|verde|roș\w*|auri\w*|violet\w*|albastr\w*|neagr\w*|mov))\b/i;
  // citate între ghilimele (neverificate; regula: doar citate autentice, cu sursă) — numele scurte de icoane („Odighitria”) nu contează
  var CITAT = /[„"“][^”"„“]{25,}[”"“]/;
  var LIMITE = { predica: { max: 2, rest: 0.6 }, sinaxar: { max: 7, rest: 0.5 } };
  function textFaraStraini(text, straine, camp) {
    var L = LIMITE[camp], predica = camp === 'predica', scoase = 0, urmeaza = false;
    var par = String(text).split(/\n+/).map(function (p) {
      return (p.match(/[^.!?]+(?:[.!?]+["”»)]*|$)/g) || []).map(function (x) { return x.trim(); }).filter(function (prop) {
        if (!prop) return false;
        var strain = numesteStrain(prop, straine, predica);
        var rau = strain || POST.test(prop) || CITAT.test(prop) || (urmeaza && CONTINUARE.test(prop));
        urmeaza = strain || (urmeaza && rau && CONTINUARE.test(prop));
        if (rau) scoase++;
        return !rau;
      }).join(' ');
    }).filter(function (p) { return p.trim(); });
    var rest = par.join('\n\n');
    return scoase <= L.max && rest.length >= 200 && rest.length >= L.rest * String(text).length && !numesteStrain(rest, straine, predica) ? rest : null;
  }
  var NEUTRU = { sfant_viata: 'Viața sfântului zilei nu este disponibilă momentan.', sinaxar: 'Sinaxarul zilei nu este disponibil momentan.',
                 tropar: 'Troparul nu este disponibil momentan.', condac: 'Condacul nu este disponibil momentan.', predica: 'Predica zilei nu este disponibilă momentan.' };
  function aplicaValidat(rand, V) {
    var z = rand && typeof rand === 'object' && rand.data_calendaristica && V[rand.data_calendaristica];
    if (!z) return;
    // Text verificat (din Viețile Sfinților) pentru zilele unde textul generat are erori: îl înlocuiește pe cel generat
    if (z.viata_verificata) {
      var vv = z.viata_verificata + (z.sursa_viata ? '\n\nSursa: ' + z.sursa_viata + '.' : '');
      if ('sfant_viata' in rand) rand.sfant_viata = vv;
      if ('sinaxar' in rand) rand.sinaxar = vv;
    }
    var straine = pomeniriStraine(rand.sfant_nume, z);
    Object.keys(NEUTRU).forEach(function (k) {
      if (typeof rand[k] !== 'string') return;
      var strain = straine.length && numesteStrain(rand[k], straine, k === 'predica');
      if (!strain && !(LIMITE[k] && (POST.test(rand[k]) || CITAT.test(rand[k])))) return;
      rand[k] = (LIMITE[k] && textFaraStraini(rand[k], straine, k)) || NEUTRU[k];
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
            (Array.isArray(d) ? d : [d]).forEach(function (rand) { curata(rand); aplicaValidat(rand, V); retineLecturi(rand); retineZi(rand); });
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
    '.lectura-sursa .lectura-nota{margin:10px 0 0;font-size:.92rem;color:#555}' +
    '.lectura-1914{background:#fff;border:1px solid #E5E9F2;font-family:Newsreader,Georgia,serif;font-size:1.18rem;line-height:1.75;color:#1a1a1a}' +
    '.lectura-1914 .lectura-text p{margin:0 0 .6em}' +
    '.lectura-1914 sup{font-family:Inter,system-ui,sans-serif;font-size:.68em;font-weight:600;color:#002B7F;margin-right:2px;vertical-align:.45em}' +
    '.lectura-1914 .lectura-asteptare{color:#555;font-style:italic}' +
    '.lectura-1914 .lectura-nota{font-family:Inter,system-ui,sans-serif;font-size:.85rem;border-top:1px solid #E5E9F2;padding-top:8px}';
  var st = document.createElement('style');
  st.id = 'corectura-provizorie-css';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  // ── 3. Referință + link în locul textului integral ─────────────────────────
  // Textul integral al Apostolului și Evangheliei: Biblia 1914, Ediția Sfântului Sinod (domeniu public),
  // din fișiere statice /data/biblia-1914/<carte>.json (vezi data/biblia-1914/SURSA.md). Fără AI, fără linkuri externe.
  var BIBLIA_V = '1';
  var lecturi = {};
  var asteapta = [];   // casetele create înainte să sosească referința zilei din baza de date
  function retineLecturi(r) {
    if (r && r.data_calendaristica) lecturi[r.data_calendaristica] = {
      apostol: [r.apostol_carte, r.apostol_versete], evanghelie: [r.evanghelie_carte, r.evanghelie_versete] };
    if (r && r.data_calendaristica === isoRo(0) && asteapta.length) {
      var lista = asteapta; asteapta = [];
      lista.forEach(function (x) { umple(x[0], x[1], true); });
    }
  }
  function referintaAzi(tip) {
    var iso = isoRo(0), l = lecturi[iso];
    if (!l) {
      try { var c = JSON.parse(localStorage.getItem('pdc_cache_v5') || 'null');
        (c && c.rows || []).forEach(function (r) { if (r.data_calendaristica === iso) retineLecturi(r); }); l = lecturi[iso]; } catch (e) {}
    }
    return l ? l[tip] : null;
  }
  // „I Corinteni” / „1 Corinteni” / „Faptele Apostolilor” / „Filipeni” -> numele fișierului
  function fisierCarte(carte) {
    var c = fd(carte).replace(/\s+/g, ' ').trim()
      .replace(/^(sfanta evanghelie de la|evanghelia dupa|epistola (sfantului apostol pavel )?catre|epistola) /, '')
      .replace(/^(iii|3)\.? /, '3 ').replace(/^(ii|2)\.? /, '2 ').replace(/^(i|1)\.? /, '1 ');
    var ALIAS = { 'faptele apostolilor': 'fapte', 'fapte': 'fapte', 'filipeni': 'filipeni', 'filipenii': 'filipeni', 'filippiseni': 'filipeni',
      'coloseni': 'coloseni', 'colaseni': 'coloseni', '1 tesaloniceni': '1-tesaloniceni', '2 tesaloniceni': '2-tesaloniceni',
      '1 tesalonicheni': '1-tesaloniceni', '2 tesalonicheni': '2-tesaloniceni', 'iacob': 'iacov' };
    if (ALIAS[c]) return ALIAS[c];
    var ok = ['matei', 'marcu', 'luca', 'ioan', 'romani', '1 corinteni', '2 corinteni', 'galateni', 'efeseni', '1 timotei', '2 timotei', 'tit',
      'filimon', 'evrei', 'iacov', '1 petru', '2 petru', '1 ioan', '2 ioan', '3 ioan', 'iuda'];
    return ok.indexOf(c) !== -1 ? c.replace(' ', '-') : null;
  }
  // „8, 5-15” | „8:5-15” | „15:17-27; 16:1-2” | „10, 32-33; 37-38; 19, 27-30” | „8:28-9:1” -> [[cap, v], ...]
  function versete(ref) {
    var lista = [], cap = null, ok = true;
    function interval(a, b) { for (var k = a; k <= b; k++) lista.push([cap, k]); }
    String(ref || '').replace(/\([^)]*\)/g, '').split(/;|\s+și\s+/).forEach(function (seg) {
      seg = seg.trim(); if (!seg || !ok) return;
      var m = /^(\d+)\s*([,:])\s*(.+)$/.exec(seg), sep = ':';
      if (m) { cap = +m[1]; sep = m[2]; seg = m[3]; }
      if (cap === null) { ok = false; return; }
      var peste = new RegExp('^(\\d+)\\s*[-–]\\s*(\\d+)\\s*' + sep + '\\s*(\\d+)$').exec(seg); // 8:28-9:1 sau 8, 28-9, 1
      if (peste && +peste[2] === cap + 1) { interval(+peste[1], 200); cap = +peste[2]; interval(1, +peste[3]); return; }
      seg.split(',').forEach(function (p) {
        p = p.trim(); var x;
        if ((x = /^(\d+)\s*[-–]\s*(\d+)$/.exec(p))) interval(+x[1], +x[2]);
        else if ((x = /^(\d+)$/.exec(p))) interval(+x[1], +x[1]);
        else ok = false;
      });
    });
    return ok && lista.length ? lista : null;
  }
  var carti = {};
  function incarcaCarte(f) {
    if (!carti[f]) carti[f] = fetch('/data/biblia-1914/' + f + '.json?v=' + BIBLIA_V).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return carti[f];
  }
  function escapa(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function roman(r) {
    var V = { I: 1, V: 5, X: 10, L: 50 }, n = 0;
    for (var i = 0; i < r.length; i++) n += V[r[i]] < (V[r[i + 1]] || 0) ? -V[r[i]] : V[r[i]];
    return String(n);
  }
  function textPericopa(carte, ref) {
    // Formate întâlnite în baza de date: „Matei 10:32-33” într-un singur câmp, „Ioan 6:35-39” în câmpul versetelor, capitole „IX, 1-8”
    var t = /^((?:[123]|I{1,3})\s+)?([^\d]+?)\s+(\d.*)$/.exec(String(carte || '').trim());
    if (t) { carte = (t[1] || '') + t[2]; if (!String(ref || '').trim()) ref = t[3]; }
    ref = String(ref || '').trim().replace(/^((?:[123]|I{1,3})\s+)?[A-Za-zĂÂÎȘŞȚŢăâîșşțţ]{3,}(\s+[A-Za-zăâîșşțţ]+)?\s+(?=\d)/, '');
    ref = ref.replace(/(^|;)\s*([IVXL]+)\s*(?=[,:])/g, function (_, a, r) { return a + roman(r); });
    var f = fisierCarte(carte), vs = versete(ref);
    if (!f || !vs) return Promise.reject(new Error('referință necunoscută'));
    return incarcaCarte(f).then(function (B) {
      var html = [], prim = true;
      vs.forEach(function (cv) {
        var cap = B[cv[0]]; if (!cap) return;
        var v = cv[1], t = cap[v];
        if (t === undefined) return;                                   // peste sfârșitul capitolului (interval deschis)
        if (t === '' && prim) { while (v > 1 && cap[v] === '') v--; t = cap[v]; }  // textul e în versetul precedent (numerotarea 1914)
        if (t === '') return;
        prim = false;
        html.push('<p><sup>' + v + '</sup> ' + escapa(t) + '</p>');
      });
      if (!html.length) throw new Error('fără versete');
      return html.join('');
    });
  }
  function cutie(tip) {
    var numeLectura = tip === 'apostol' ? 'Apostolului' : 'Evangheliei';
    return '<div class="lectura-sursa lectura-1914" data-corectura="1" data-lectura="' + tip + '">' +
      '<div class="lectura-text"><p class="lectura-asteptare">Pregătim textul ' + numeLectura + '…</p></div>' +
      '<p class="lectura-nota">Textul: Biblia 1914, Ediția Sfântului Sinod.</p></div>';
  }
  function umple(el, tip, final) {
    var r = referintaAzi(tip), box = el.querySelector('.lectura-text');
    var nu = '<p>Textul ' + (tip === 'apostol' ? 'Apostolului' : 'Evangheliei') + ' zilei nu este disponibil momentan.</p>';
    if (!box) return;
    if (!r && !final) {   // datele zilei încă nu au sosit: așteptăm (cel mult 10 secunde)
      asteapta.push([el, tip]);
      setTimeout(function () {
        var i = asteapta.findIndex(function (x) { return x[0] === el; });
        if (i !== -1) { asteapta.splice(i, 1); umple(el, tip, true); }
      }, 10000);
      return;
    }
    if (!r || !r[0] || !r[1]) { box.innerHTML = nu; return; }
    textPericopa(r[0], r[1]).then(function (h) { box.innerHTML = h; }, function () { box.innerHTML = nu; });
  }
  window.pdcCutieLectura = cutie;

  var TINTE = [
    ['apostol-text-complet', 'apostol'], ['evanghelie-text-complet', 'evanghelie'],
    ['apostol-text', 'apostol'], ['evanghelie-text', 'evanghelie'], ['ev-text', 'evanghelie'],
    ['apostol-text-acasa', 'apostol'], ['evanghelie-text-acasa', 'evanghelie']
  ];
  // Pagini /sinaxar și /sinaxarul-zilei (inclusiv versiuni vechi păstrate pe telefon): caseta „Viața din Sinaxar nu este
  // disponibilă momentan pe această pagină” primește sinaxarul zilei, deja curățat de regulile de mai sus.
  var ziCurata = null;
  function retineZi(r) {
    if (r && r.data_calendaristica === isoRo(0)) { ziCurata = r; completeazaSinaxar(); }
  }
  function completeazaSinaxar() {
    var el = document.getElementById('viata-text');
    if (!el || !ziCurata || !/nu este disponibil[ăa] momentan pe această pagină/.test(el.textContent || '')) return;
    var t = [ziCurata.sinaxar, ziCurata.sfant_viata].filter(function (x) { return x && x.length > 200 && !/nu este disponibil/.test(x); })[0];
    if (!t) return;
    el.innerHTML = t.split(/\n+/).map(function (p) { return '<p style="margin:0 0 12px">' + escapa(p) + '</p>'; }).join('');
    var tt = document.getElementById('viata-titlu'); if (tt) tt.textContent = 'Din Sinaxarul zilei';
  }
  function aplica() {
    if (!C.activ) return;
    completeazaSinaxar();
    TINTE.forEach(function (t) {
      document.querySelectorAll('#' + t[0]).forEach(function (el) {
        if (el.getAttribute('data-corectura') === '1' && el.querySelector('.lectura-sursa')) return;
        el.setAttribute('data-corectura', '1');
        el.innerHTML = cutie(t[1]);
        umple(el, t[1]);
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
