#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Adaugă integrarea Supabase în toate paginile individuale.
Inserează scriptul de enhancement înainte de </body>.
"""

import os
import re

PAGES = [
    'apostolul-zilei/index.html',
    'evanghelia-zilei/index.html',
    'sinaxarul-zilei/index.html',
    'predica-zilei/index.html',
    'calendar-ortodox-azi/index.html',
]

# Scriptul Supabase de adăugat pentru apostolul-zilei
SUPABASE_APOSTOL = '''<script src="/js/supabase-loader.js"></script>
<script>
(async function() {
  const azi = new Date();
  const dataStr = azi.toISOString().split('T')[0];
  const date = await incarcaDateSupabase(dataStr);
  if (!date) return;

  const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const ZILE_RO = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
  const dataFormatata = ZILE_RO[azi.getDay()] + ', ' + azi.getDate() + ' ' + LUNI_RO[azi.getMonth()] + ' ' + azi.getFullYear();

  if (date.apostol_carte && date.apostol_text) {
    const carteVerset = date.apostol_carte + ' ' + (date.apostol_versete || '');
    // Actualizează titlul și referința
    const titluEl = document.getElementById('apostol-titlu');
    if (titluEl) titluEl.textContent = 'Apostolul zilei — ' + carteVerset;
    const refEl = document.getElementById('apostol-referinta');
    if (refEl) refEl.textContent = carteVerset;
    // Actualizează textul
    const textEl = document.getElementById('apostol-text');
    if (textEl) textEl.textContent = date.apostol_text;
    // Actualizează meta
    document.getElementById('meta-title').textContent = `Apostolul Zilei — ${carteVerset} | Povești de Credință`;
    if (date.meta_description) document.getElementById('meta-desc').setAttribute('content', date.meta_description);
    // Schema.org
    document.getElementById('schema-article').textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Apostolul Zilei — " + carteVerset,
      "description": "Textul complet al Apostolului zilei de azi: " + carteVerset,
      "datePublished": dataStr,
      "publisher": {"@type":"Organization","name":"Povești de Credință","url":"https://povestidecredinta.ro"}
    });
  }
})();
</script>'''

# Scriptul Supabase pentru evanghelia-zilei
SUPABASE_EVANGHELIE = '''<script src="/js/supabase-loader.js"></script>
<script>
(async function() {
  const azi = new Date();
  const dataStr = azi.toISOString().split('T')[0];
  const date = await incarcaDateSupabase(dataStr);
  if (!date) return;

  const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const ZILE_RO = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];

  if (date.evanghelie_carte && date.evanghelie_text) {
    const carteVerset = date.evanghelie_carte + ' ' + (date.evanghelie_versete || '');
    const titluEl = document.getElementById('evanghelie-titlu');
    if (titluEl) titluEl.textContent = 'Evanghelia zilei — ' + carteVerset;
    const refEl = document.getElementById('evanghelie-referinta');
    if (refEl) refEl.textContent = carteVerset;
    const textEl = document.getElementById('evanghelie-text');
    if (textEl) textEl.textContent = date.evanghelie_text;
    document.getElementById('meta-title').textContent = `Evanghelia Zilei — ${carteVerset} | Povești de Credință`;
    if (date.meta_description) document.getElementById('meta-desc').setAttribute('content', date.meta_description);
    document.getElementById('schema-article').textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Evanghelia Zilei — " + carteVerset,
      "description": "Textul complet al Evangheliei zilei de azi: " + carteVerset,
      "datePublished": dataStr,
      "publisher": {"@type":"Organization","name":"Povești de Credință","url":"https://povestidecredinta.ro"}
    });
  }
})();
</script>'''

# Scriptul Supabase pentru sinaxarul-zilei
SUPABASE_SINAXAR = '''<script src="/js/supabase-loader.js"></script>
<script>
(async function() {
  const azi = new Date();
  const dataStr = azi.toISOString().split('T')[0];
  const date = await incarcaDateSupabase(dataStr);
  if (!date) return;

  const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const ZILE_RO = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
  const dataFormatata = ZILE_RO[azi.getDay()] + ', ' + azi.getDate() + ' ' + LUNI_RO[azi.getMonth()] + ' ' + azi.getFullYear();

  if (date.sinaxar) {
    const sinaxarEl = document.getElementById('sinaxar-text');
    if (sinaxarEl) sinaxarEl.textContent = date.sinaxar;
  }
  if (date.sfant_nume) {
    const titluEl = document.getElementById('sinaxar-titlu');
    if (titluEl) titluEl.textContent = 'Sinaxarul zilei — ' + date.sfant_nume.split(';')[0];
    document.getElementById('meta-title').textContent = `Sinaxarul Zilei — ${date.sfant_nume.split(';')[0]} | Povești de Credință`;
    if (date.meta_description) document.getElementById('meta-desc').setAttribute('content', date.meta_description);
  }
  if (date.sfinti_secundari) {
    const sfEl = document.getElementById('sfinti-secundari');
    if (sfEl) sfEl.textContent = date.sfinti_secundari;
  }
})();
</script>'''

# Scriptul Supabase pentru predica-zilei
SUPABASE_PREDICA = '''<script src="/js/supabase-loader.js"></script>
<script>
(async function() {
  const azi = new Date();
  const dataStr = azi.toISOString().split('T')[0];
  const date = await incarcaDateSupabase(dataStr);
  if (!date) return;

  const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const ZILE_RO = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
  const dataFormatata = ZILE_RO[azi.getDay()] + ', ' + azi.getDate() + ' ' + LUNI_RO[azi.getMonth()] + ' ' + azi.getFullYear();

  if (date.predica) {
    const predicaEl = document.getElementById('predica-text');
    if (predicaEl) predicaEl.textContent = date.predica;
  }
  if (date.cuvant_folos) {
    const cuvantEl = document.getElementById('cuvant-folos-text');
    if (cuvantEl) cuvantEl.textContent = date.cuvant_folos;
  }
  if (date.sfant_nume) {
    document.getElementById('meta-title').textContent = `Predica Zilei — ${dataFormatata} | Povești de Credință`;
    if (date.meta_description) document.getElementById('meta-desc').setAttribute('content', date.meta_description);
  }
  if (date.evanghelie_carte) {
    const evRef = document.getElementById('evanghelie-ref-predica');
    if (evRef) evRef.textContent = date.evanghelie_carte + ' ' + (date.evanghelie_versete || '');
  }
})();
</script>'''

# Scriptul Supabase pentru calendar-ortodox-azi
SUPABASE_CALENDAR_AZI = '''<script src="/js/supabase-loader.js"></script>
<script>
(async function() {
  const azi = new Date();
  const dataStr = azi.toISOString().split('T')[0];
  const date = await incarcaDateSupabase(dataStr);
  if (!date) return;

  const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const ZILE_RO = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
  const dataFormatata = ZILE_RO[azi.getDay()] + ', ' + azi.getDate() + ' ' + LUNI_RO[azi.getMonth()] + ' ' + azi.getFullYear();
  const postLabel = {'post':'🕯️ Zi de post','dezlegare':'✅ Dezlegare la toate','dezlegare_peste':'🐟 Dezlegare la pește','dezlegare_vin_ulei':'🫒 Dezlegare la vin și untdelemn'}[date.tip_post] || '✅ Dezlegare';

  // Actualizează toate secțiunile paginii calendar-ortodox-azi
  if (date.sfant_nume) {
    const sfEl = document.getElementById('sfant-principal');
    if (sfEl) sfEl.textContent = date.sfant_nume;
    const postEl = document.getElementById('post-info');
    if (postEl) postEl.textContent = postLabel;
    document.getElementById('meta-title').textContent = `Calendar Ortodox Azi — ${dataFormatata} | Povești de Credință`;
    if (date.meta_description) document.getElementById('meta-desc').setAttribute('content', date.meta_description);
  }
  if (date.apostol_carte) {
    const apEl = document.getElementById('apostol-card');
    if (apEl) apEl.innerHTML = '<strong>' + date.apostol_carte + ' ' + (date.apostol_versete||'') + '</strong><br>' + (date.apostol_text||'').substring(0,150) + '...';
  }
  if (date.evanghelie_carte) {
    const evEl = document.getElementById('evanghelie-card');
    if (evEl) evEl.innerHTML = '<strong>' + date.evanghelie_carte + ' ' + (date.evanghelie_versete||'') + '</strong><br>' + (date.evanghelie_text||'').substring(0,150) + '...';
  }
  if (date.sinaxar) {
    const sinEl = document.getElementById('sinaxar-card');
    if (sinEl) sinEl.textContent = date.sinaxar.substring(0, 200) + '...';
  }
  if (date.predica) {
    const prEl = document.getElementById('predica-card');
    if (prEl) prEl.textContent = date.predica.substring(0, 200) + '...';
  }
})();
</script>'''

SCRIPTS = {
    'apostolul-zilei/index.html': SUPABASE_APOSTOL,
    'evanghelia-zilei/index.html': SUPABASE_EVANGHELIE,
    'sinaxarul-zilei/index.html': SUPABASE_SINAXAR,
    'predica-zilei/index.html': SUPABASE_PREDICA,
    'calendar-ortodox-azi/index.html': SUPABASE_CALENDAR_AZI,
}

base = '/home/ubuntu/povesti-de-credinta'

for page, script in SCRIPTS.items():
    path = os.path.join(base, page)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verifică dacă supabase-loader.js e deja adăugat
    if 'supabase-loader.js' in content:
        print(f'⏭️  {page} — deja are Supabase, skip')
        continue
    
    # Inserează înainte de <script src="/js/app.js">
    old = '<script src="/js/app.js"></script>\n</body>'
    new = script + '\n<script src="/js/app.js"></script>\n</body>'
    
    if old in content:
        content = content.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✅ {page} — Supabase adăugat')
    else:
        print(f'⚠️  {page} — pattern nu a fost găsit, verifică manual')

print('\n✅ Toate paginile actualizate!')
