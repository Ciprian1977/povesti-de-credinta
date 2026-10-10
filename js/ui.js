/* ui.js — comun pe toate paginile: meniul complet, fila activă din meniul de jos, data din antet.
   Nu depinde de app.js (care nu rulează pe toate paginile). */
(function () {
  var nav = document.getElementById('nav-mobil');
  var buton = document.getElementById('buton-meniu');
  var voal = document.getElementById('voal-meniu');

  function seteaza(deschis) {
    if (!nav) return;
    nav.classList.toggle('deschis', deschis);
    if (voal) voal.classList.toggle('activ', deschis);
    if (buton) buton.setAttribute('aria-expanded', deschis ? 'true' : 'false');
    document.documentElement.style.overflow = deschis ? 'hidden' : '';
  }
  if (buton && nav) {
    buton.addEventListener('click', function () { seteaza(!nav.classList.contains('deschis')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) seteaza(false); });
    if (voal) voal.addEventListener('click', function () { seteaza(false); });
    nav.querySelectorAll('[data-inchide-meniu]').forEach(function (b) { b.addEventListener('click', function () { seteaza(false); buton.focus(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') seteaza(false); });
    window.addEventListener('popstate', function () { seteaza(false); });
  }

  // Fila activă din meniul de jos, după adresă
  function filaActiva() {
    var p = location.pathname.replace(/\/+$/, '') || '/';
    var fila = 'azi';
    if (/^\/calendar/.test(p) || /^\/posturi/.test(p)) fila = 'calendar';
    else if (/^\/rugaciun/.test(p)) fila = 'rugaciuni';
    else if (/^\/acatist/.test(p)) fila = 'acatiste';
    else if (p !== '/' && !/^\/(sfant|sfinti|sinaxar|apostol|evanghel|predica)/.test(p)) fila = '';
    document.querySelectorAll('.bottom-nav .nav-item[data-fila]').forEach(function (a) {
      var activ = a.getAttribute('data-fila') === fila;
      a.classList.toggle('activ', activ);
      if (activ) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  filaActiva();
  window.addEventListener('popstate', filaActiva);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-ruta]');
    if (a) setTimeout(filaActiva, 50);
  });

  // Listele de ore din setări: dacă o oră salvată nu mai e în listă, revenim la ora implicită
  function normalizeazaOre() {
    document.querySelectorAll('select[data-ora-implicita]').forEach(function (sel) {
      if (!sel.value) { sel.value = sel.getAttribute('data-ora-implicita'); sel.dispatchEvent(new Event('change')); }
    });
  }
  [300, 1200, 3000].forEach(function (t) { setTimeout(normalizeazaOre, t); });
  window.addEventListener('popstate', function () { setTimeout(normalizeazaOre, 300); });

  // Data de azi (ora României) în antet
  var d = document.getElementById('antet-data');
  if (d) {
    try {
      var f = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
      d.textContent = f.charAt(0).toUpperCase() + f.slice(1);
    } catch (e) {}
  }
})();

/* ═══ Instalarea aplicației (PWA) — buton mereu vizibil + instrucțiuni pe fiecare telefon ═══ */
(function () {
  var promptInstalare = null;
  var instalata = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); promptInstalare = e; });
  window.addEventListener('appinstalled', function () { instalata = true; ascunde(); });
  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('/sw.js').catch(function () {}); } catch (e) {} }

  var ua = navigator.userAgent || '';
  var iOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var inApp = /FBAN|FBAV|Instagram|Line\/|GSA\/|; wv\)|WhatsApp/i.test(ua);
  var samsung = /SamsungBrowser/i.test(ua);
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M12 7v7M9 11l3 3 3-3M10 18.5h4"/></svg>';

  function pasi() {
    if (inApp) return ['Deschide situl în <strong>Chrome</strong> (sau Safari pe iPhone): apasă ⋮ sau ↗ sus și alege „Deschide în browser”.', 'Apoi apasă din nou „Instalează aplicația”.'];
    if (iOS) return ['Deschide <strong>www.povestidecredinta.ro</strong> în <strong>Safari</strong>.', 'Apasă butonul <strong>Partajează</strong> (pătratul cu săgeata în sus) din bara de jos.', 'Derulează și alege <strong>„Adaugă pe ecranul principal”</strong>.', 'Apasă <strong>„Adaugă”</strong> sus în dreapta. Aplicația apare printre celelalte aplicații.'];
    if (samsung) return ['Apasă meniul <strong>☰</strong> din bara de jos.', 'Alege <strong>„Adăugare pagină la”</strong> → <strong>„Ecran de pornire”</strong>.', 'Confirmă cu <strong>„Adăugare”</strong>.'];
    return ['Apasă cele trei puncte <strong>⋮</strong> din colțul de sus al Chrome.', 'Alege <strong>„Instalează aplicația”</strong> sau <strong>„Adaugă pe ecranul de pornire”</strong>.', 'Confirmă cu <strong>„Instalează”</strong>. Aplicația apare printre celelalte aplicații.'];
  }
  function fereastra() {
    var v = document.getElementById('instalare-fereastra');
    if (v) v.remove();
    v = document.createElement('div');
    v.id = 'instalare-fereastra'; v.className = 'instalare-fereastra'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-labelledby', 'instalare-titlu');
    v.innerHTML = '<div class="instalare-cutie"><h2 id="instalare-titlu">Instalează aplicația pe telefon</h2>' +
      '<p>Sfântul zilei, rugăciunile și calendarul, deschise dintr-o singură atingere, ca orice aplicație. Gratuit, fără cont.</p>' +
      '<ol>' + pasi().map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ol>' +
      '<button type="button" class="instalare-inchide">Am înțeles</button></div>';
    v.addEventListener('click', function (e) { if (e.target === v || e.target.classList.contains('instalare-inchide')) v.remove(); });
    document.body.appendChild(v);
    v.querySelector('.instalare-inchide').focus();
  }
  function instaleaza() {
    if (promptInstalare) {
      promptInstalare.prompt();
      promptInstalare.userChoice.then(function () { promptInstalare = null; });
    } else fereastra();
  }
  window.pdcInstaleaza = instaleaza;

  function ascunde() { document.querySelectorAll('.instalare-intrare').forEach(function (x) { x.remove(); }); }
  function adauga() {
    if (instalata) return;
    var nav = document.getElementById('nav-mobil'), cap = nav && nav.querySelector('.meniu-cap');
    if (cap && !nav.querySelector('.instalare-intrare')) {
      cap.insertAdjacentHTML('afterend', '<button type="button" class="instalare-intrare instalare-meniu">' + ICON + 'Instalează aplicația pe telefon</button>');
    }
    var home = document.querySelector('main#pagina-acasa');
    if (home && !home.querySelector('.instalare-intrare')) {
      var tinta = document.getElementById('titlu-youtube');
      var sec = tinta ? tinta.closest('section') : null;
      var html = '<section class="bloc instalare-intrare instalare-card"><h2 class="titlu-sectiune">Ia aplicația pe telefon</h2>' +
        '<p class="text-intro">Sfântul zilei, rugăciunile și notificările de dimineață, la o atingere distanță. Gratuit, fără cont și fără magazin de aplicații.</p>' +
        '<button type="button" class="buton-contur instalare-buton">' + ICON + 'Instalează aplicația</button></section><div class="banda instalare-intrare" aria-hidden="true"></div>';
      if (sec) sec.insertAdjacentHTML('beforebegin', html); else home.insertAdjacentHTML('beforeend', html);
    }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.instalare-meniu, .instalare-buton')) { e.preventDefault(); instaleaza(); }
  });
  adauga();
  document.addEventListener('DOMContentLoaded', adauga);
})();
