/* video-rugaciuni.js — butonul „Ascultă rugăciunea zilei" (videoclipurile de pe canalul YouTube).
 *
 * ▶ CA SĂ ADAUGI / SCHIMBI UN VIDEOCLIP: pune ID-ul videoclipului la ziua respectivă.
 *   ID-ul e partea de după „v=" din link: youtube.com/watch?v=AbC123xyz → 'AbC123xyz'
 *   (sau după „youtu.be/" / „/shorts/"). Dacă o zi rămâne goală, butonul nu apare în ziua aceea.
 */
var VIDEO_RUGACIUNI = {
  luni: 'oq-WPnzBGLs',
  marti: '',
  miercuri: '',
  joi: '',
  vineri: '',
  sambata: '',
  duminica: ''
};

(function () {
  var SLUGURI = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'];
  var NUME = { luni: 'Luni', marti: 'Marți', miercuri: 'Miercuri', joi: 'Joi', vineri: 'Vineri', sambata: 'Sâmbătă', duminica: 'Duminică' };

  function sluguAzi() {
    try {
      var zi = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Bucharest', weekday: 'short' }).format(new Date());
      return SLUGURI[['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(zi)];
    } catch (e) { return SLUGURI[new Date().getDay()]; }
  }
  function idPentru(slug) {
    var v = (VIDEO_RUGACIUNI[slug] || '').trim();
    var m = v.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : (/^[\w-]{11}$/.test(v) ? v : '');
  }

  // Player „ușor": doar o imagine până la apăsare (pagina rămâne rapidă), apoi videoclipul YouTube
  function player(id, slug) {
    var t = 'Rugăciunea zilei de ' + NUME[slug];
    return '<div class="video-rug" data-id="' + id + '">' +
      '<button type="button" class="video-rug-start" aria-label="Pornește videoclipul: ' + t + '">' +
      '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">' +
      '<span class="video-rug-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>' +
      '<span class="video-rug-eticheta">▶ Ascultă: ' + t + '</span></button></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.video-rug-start');
    if (!b) return;
    var box = b.parentNode, id = box.getAttribute('data-id');
    box.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1" title="Rugăciunea zilei" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  });

  function buton(slug) {
    return '<button type="button" class="buton-asculta" data-slug="' + slug + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>Ascultă rugăciunea zilei</button>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.buton-asculta');
    if (!b) return;
    var slug = b.getAttribute('data-slug'), id = idPentru(slug);
    var urm = b.nextElementSibling;
    if (urm && urm.classList.contains('video-rug')) { urm.remove(); return; }
    b.insertAdjacentHTML('afterend', player(id, slug));
    var start = b.nextElementSibling.querySelector('.video-rug-start');
    if (start) start.click(); // pornește direct
  });

  function aplica() {
    var azi = sluguAzi();
    // 1) Pagina principală — sub „Rugăciunea zilei" din „Citește și"
    var rand = document.querySelector('main#pagina-acasa .lista-sageti a[href="/rugaciunea-zilei"]');
    if (rand && idPentru(azi) && !document.querySelector('.asculta-acasa')) {
      rand.parentNode.insertAdjacentHTML('afterend', '<li class="asculta-acasa">' + buton(azi) + '</li>');
    }
    // 2) Pagina rugăciunii unei zile — videoclipul sus, sub titlu
    var pag = document.getElementById('ruta-rugaciunea-zi');
    var m = location.pathname.match(/\/rugaciunea-zilei\/([a-z]+)/);
    if (pag && m && idPentru(m[1]) && !pag.querySelector('.video-rug, .buton-asculta')) {
      var hdr = pag.querySelector('.ruta-header');
      if (hdr) hdr.insertAdjacentHTML('afterend', '<div class="asculta-pagina">' + buton(m[1]) + '</div>');
    }
    // 3) Lista rugăciunilor săptămânii — în cardul „Rugăciunea de azi"
    var card = document.querySelector('.card-rugaciune-azi');
    if (card && idPentru(azi) && !card.querySelector('.buton-asculta')) {
      var link = card.querySelector('a');
      if (link) link.insertAdjacentHTML('beforebegin', buton(azi));
    }
  }
  var t; new MutationObserver(function () { clearTimeout(t); t = setTimeout(aplica, 120); })
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', aplica);
  aplica();
})();
