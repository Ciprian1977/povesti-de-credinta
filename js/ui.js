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

  // Data de azi (ora României) în antet
  var d = document.getElementById('antet-data');
  if (d) {
    try {
      var f = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
      d.textContent = f.charAt(0).toUpperCase() + f.slice(1);
    } catch (e) {}
  }
})();
