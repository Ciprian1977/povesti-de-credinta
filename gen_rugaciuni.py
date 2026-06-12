#!/usr/bin/env python3
import json, os

BASE = "/home/ubuntu/povesti-de-credinta"
data = json.load(open(f"{BASE}/rugaciuni.json", encoding="utf-8"))

HEADER = '''<header class="header">
  <div class="header-inner">
    <a href="/" class="logo">
      <div class="logo-icon">&#128538;</div>
      <div class="logo-text">
        <span class="logo-titlu">Pove&#537;ti de Credin&#539;&#259;</span>
        <span class="logo-subtitlu">Calendar Ortodox Rom&#226;nesc</span>
      </div>
    </a>
    <nav class="nav-desktop" aria-label="Naviga&#539;ie principal&#259;">
      <a href="/">Acas&#259;</a>
      <a href="/calendar.html">Calendar</a>
      <a href="/rugaciuni.html" class="activ">Rug&#259;ciuni</a>
      <a href="/acatiste.html">Acatiste</a>
      <a href="/faq.html">FAQ</a>
      <a href="/despre.html">Despre</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Meniu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <nav class="nav-mobil" id="nav-mobil" aria-label="Meniu mobil">
    <a href="/">&#127968; Acas&#259;</a>
    <a href="/calendar.html">&#128197; Calendar Ortodox 2026</a>
    <a href="/rugaciuni.html">&#128591; Rug&#259;ciuni</a>
    <a href="/acatiste.html">&#128214; Acatiste</a>
    <a href="/pricesne.html">&#127925; Pricesne</a>
    <a href="/posturi.html">&#128257; Posturi</a>
    <a href="/faq.html">&#10067; &#206;ntreb&#259;ri frecvente</a>
    <a href="/despre.html">&#10013;&#65039; Despre noi</a>
    <a href="/contact.html">&#128231; Contact</a>
  </nav>
</header>'''

FOOTER = '''<footer class="footer">
  <div class="footer-logo">&#10013;&#65039; Pove&#537;ti de Credin&#539;&#259;</div>
  <p style="font-size:0.82rem;opacity:0.65;margin-bottom:4px">Calendar Ortodox Rom&#226;nesc</p>
  <div class="footer-social">
    <a href="https://youtube.com/@povestidecredinta" target="_blank" rel="noopener">&#128250; YouTube</a>
    <a href="https://www.facebook.com/povestidecredinta" target="_blank" rel="noopener">&#128216; Facebook</a>
  </div>
  <div class="footer-links">
    <a href="/despre.html">Despre noi</a>
    <a href="/contact.html">Contact</a>
    <a href="/faq.html">FAQ</a>
    <a href="/politica-confidentialitate.html">Confiden&#539;ialitate</a>
    <a href="/politica-cookies.html">Cookies</a>
    <a href="/sitemap.xml">Sitemap</a>
  </div>
  <div class="footer-copy">
    &copy; 2026 Pove&#537;ti de Credin&#539;&#259; &mdash; povestidecredinta.ro<br>
    Con&#539;inut conform Sinaxarului Bisericii Ortodoxe Rom&#226;ne
  </div>
</footer>'''

BOTTOM_NAV = '''<nav class="bottom-nav" aria-label="Naviga&#539;ie rapid&#259;">
  <a href="/" class="nav-item" aria-label="Acas&#259;"><span class="nav-icon">&#127968;</span><span class="nav-label">Acas&#259;</span></a>
  <a href="/calendar.html" class="nav-item" aria-label="Calendar"><span class="nav-icon">&#128197;</span><span class="nav-label">Calendar</span></a>
  <a href="/rugaciuni.html" class="nav-item activ" aria-label="Rug&#259;ciuni"><span class="nav-icon">&#128591;</span><span class="nav-label">Rug&#259;ciuni</span></a>
  <a href="/acatiste.html" class="nav-item" aria-label="Acatiste"><span class="nav-icon">&#128214;</span><span class="nav-label">Acatiste</span></a>
  <a href="/faq.html" class="nav-item" aria-label="FAQ"><span class="nav-icon">&#10067;</span><span class="nav-label">FAQ</span></a>
</nav>'''

NAV_GRID = '''<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.83rem">
  <a href="/rugaciuni/rugaciunea-diminetii/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#127749; Rug&#259;ciunea diminea&#539;ii</a>
  <a href="/rugaciuni/rugaciunea-serii/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#127769; Rug&#259;ciunea serii</a>
  <a href="/rugaciuni/rugaciunea-lui-iisus/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#10013;&#65039; Rug&#259;ciunea lui Iisus</a>
  <a href="/rugaciuni/tatal-nostru/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#128591; Tat&#259;l Nostru</a>
  <a href="/rugaciuni/catre-maica-domnului/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#128538; C&#259;tre Maica Domnului</a>
  <a href="/rugaciuni/pentru-bolnavi/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#128138; Pentru bolnavi</a>
  <a href="/rugaciuni/pentru-morti/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#128257; Pentru mor&#539;i</a>
  <a href="/rugaciuni/de-multumire/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#127775; De mul&#539;umire</a>
  <a href="/rugaciuni/inainte-de-masa/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#127838; &#206;nainte de mas&#259;</a>
  <a href="/rugaciuni/dupa-masa/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#128588; Dup&#259; mas&#259;</a>
  <a href="/rugaciuni/pentru-calatorie/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#128663; Pentru c&#259;l&#259;torie</a>
  <a href="/rugaciuni/pentru-copii/" style="color:var(--visineu);text-decoration:none;padding:8px 10px;background:var(--crem);border-radius:8px;border:1px solid rgba(201,168,76,0.15)">&#128118; Pentru copii</a>
</div>'''

def esc(s):
    return s.replace('&', '&amp;').replace('"', '&quot;')

def gen_page(r):
    slug = r["slug"]
    titlu = r["titlu_display"]
    emoji = r["emoji"]
    desc_meta = r["descriere_meta"]
    desc_scurta = r["descriere_scurta"]
    cand = r["cand_se_citeste"]
    text_paras = r["text"]
    faq = r["faq"]

    # Text HTML
    text_html = ""
    for p in text_paras:
        if len(p) < 80 and (p.endswith(")") or not any(c in p for c in ".!?,")):
            text_html += f'<h3 style="font-family:var(--font-titlu);color:var(--visineu);font-size:0.95rem;margin:16px 0 8px;font-weight:600">{p}</h3>\n'
        else:
            text_html += f'<p style="margin-bottom:12px;color:var(--text-dark);line-height:1.9;font-size:0.93rem">{p}</p>\n'

    # FAQ JSON-LD
    faq_ld_items = []
    for q in faq:
        faq_ld_items.append('{"@type":"Question","name":' + json.dumps(q["q"], ensure_ascii=False) +
                            ',"acceptedAnswer":{"@type":"Answer","text":' + json.dumps(q["a"], ensure_ascii=False) + '}}')
    faq_ld = ",\n".join(faq_ld_items)

    # FAQ HTML
    faq_html = ""
    for i, q in enumerate(faq):
        faq_html += f'''
    <div style="border:1px solid rgba(201,168,76,0.2);border-radius:10px;overflow:hidden;margin-bottom:10px">
      <button onclick="toggleFaq({i})" style="width:100%;text-align:left;padding:14px 16px;background:white;border:none;cursor:pointer;font-family:var(--font-titlu);color:var(--visineu);font-size:0.9rem;font-weight:600;display:flex;justify-content:space-between;align-items:center">
        <span>{q["q"]}</span>
        <span id="fi{i}" style="font-size:1.2rem;min-width:16px">+</span>
      </button>
      <div id="fb{i}" style="display:none;padding:0 16px 14px;background:white;font-size:0.86rem;color:var(--text-medium);line-height:1.7">{q["a"]}</div>
    </div>'''

    html = f'''<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#6B1B2B">
  <title>{titlu} &#8212; Text complet ortodox | Pove&#537;ti de Credin&#539;&#259;</title>
  <meta name="description" content="{esc(desc_meta)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://povestidecredinta.ro/rugaciuni/{slug}/">
  <meta property="og:title" content="{esc(titlu)} &#8212; Pove&#537;ti de Credin&#539;&#259;">
  <meta property="og:description" content="{esc(desc_meta)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://povestidecredinta.ro/rugaciuni/{slug}/">
  <meta property="og:image" content="https://povestidecredinta.ro/images/og-image.jpg">
  <meta property="og:locale" content="ro_RO">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/images/icon-192.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Pove&#537;ti de Credin&#539;&#259;">
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
    {{"@type":"ListItem","position":1,"name":"Acas&#259;","item":"https://povestidecredinta.ro/"}},
    {{"@type":"ListItem","position":2,"name":"Rug&#259;ciuni","item":"https://povestidecredinta.ro/rugaciuni.html"}},
    {{"@type":"ListItem","position":3,"name":"{esc(titlu)}","item":"https://povestidecredinta.ro/rugaciuni/{slug}/"}}
  ]}}
  </script>
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"Article",
    "headline":"{esc(titlu)} &#8212; Text complet ortodox",
    "description":"{esc(desc_meta)}",
    "url":"https://povestidecredinta.ro/rugaciuni/{slug}/",
    "image":"https://povestidecredinta.ro/images/og-image.jpg",
    "author":{{"@type":"Organization","name":"Pove&#537;ti de Credin&#539;&#259;"}},
    "publisher":{{"@type":"Organization","name":"Pove&#537;ti de Credin&#539;&#259;","logo":{{"@type":"ImageObject","url":"https://povestidecredinta.ro/images/icon-192.png"}}}},
    "inLanguage":"ro","datePublished":"2026-01-01","dateModified":"2026-05-01"}}
  </script>
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{faq_ld}]}}
  </script>
</head>
<body>
{HEADER}
<main>
  <nav aria-label="Breadcrumb" style="padding:10px 0 4px;font-size:0.78rem;color:var(--text-light)">
    <a href="/" style="color:var(--auriu-dark);text-decoration:none">Acas&#259;</a>
    <span style="margin:0 6px">&#8250;</span>
    <a href="/rugaciuni.html" style="color:var(--auriu-dark);text-decoration:none">Rug&#259;ciuni</a>
    <span style="margin:0 6px">&#8250;</span>
    <span style="color:var(--text-medium)">{titlu}</span>
  </nav>
  <article itemscope itemtype="https://schema.org/Article">
    <header style="text-align:center;padding:16px 0 20px">
      <div style="font-size:3rem;margin-bottom:10px">{emoji}</div>
      <h1 itemprop="headline" style="font-family:var(--font-titlu);color:var(--visineu);font-size:1.7rem;margin-bottom:8px;line-height:1.3">{titlu}</h1>
      <p itemprop="description" style="color:var(--text-medium);font-size:0.9rem;line-height:1.6;max-width:560px;margin:0 auto">{desc_scurta}</p>
    </header>
    <div style="background:rgba(201,168,76,0.08);border-left:3px solid var(--auriu);border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:20px">
      <div style="font-family:var(--font-titlu);color:var(--auriu-dark);font-size:0.8rem;font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">&#128336; C&#226;nd se cite&#537;te</div>
      <p style="font-size:0.88rem;color:var(--text-medium);line-height:1.6;margin:0">{cand}</p>
    </div>
    <div class="adsense-banner" aria-label="Publicitate"><span>Publicitate</span></div>
    <div style="background:white;border:1px solid rgba(201,168,76,0.25);border-radius:12px;padding:20px 20px 16px;box-shadow:0 2px 8px rgba(107,27,43,0.06);margin:16px 0" id="text-rugaciune">
      <div style="text-align:center;margin-bottom:16px">
        <div style="display:inline-block;width:40px;height:2px;background:var(--auriu);vertical-align:middle;margin-right:10px"></div>
        <span style="font-family:var(--font-titlu);color:var(--visineu);font-size:0.85rem;font-weight:600;text-transform:uppercase;letter-spacing:1px">Textul rug&#259;ciunii</span>
        <div style="display:inline-block;width:40px;height:2px;background:var(--auriu);vertical-align:middle;margin-left:10px"></div>
      </div>
      <div style="font-family:var(--font-special);font-size:1.1rem;line-height:1.8;color:var(--text-dark);white-space:pre-wrap">{text_html}</div>
    </div>

    <!-- CTA Notificări Contextual -->
    <div style="margin:20px 0;padding:16px;background:rgba(201,168,76,0.08);border:1px dashed var(--auriu);border-radius:12px;text-align:center">
        <p style="font-size:0.88rem;color:var(--visineu-dark);margin-bottom:12px;font-weight:600">🔔 Vrei să primești memento pentru această rugăciune?</p>
        <a href="/setari-notificari" style="display:inline-block;background:var(--visineu);color:white;text-decoration:none;padding:10px 20px;border-radius:20px;font-size:0.82rem;font-weight:700;box-shadow:var(--shadow)">
            Setează Notificările
        </a>
    </div>   </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:16px 0">
      <button onclick="copieTextRugaciune()" style="flex:1;min-width:140px;background:var(--visineu);color:white;border:none;padding:12px 16px;border-radius:25px;font-size:0.88rem;cursor:pointer;font-family:var(--font-titlu);font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px">
        &#128203; Copiaz&#259; rug&#259;ciunea
      </button>
      <button onclick="trimiteWhatsApp()" style="flex:1;min-width:140px;background:#25D366;color:white;border:none;padding:12px 16px;border-radius:25px;font-size:0.88rem;cursor:pointer;font-family:var(--font-titlu);font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px">
        &#128172; Trimite pe WhatsApp
      </button>
    </div>
    <div class="adsense-banner" style="min-height:250px" aria-label="Publicitate"><span>Publicitate</span></div>
    <section style="margin-top:24px" aria-labelledby="titlu-faq">
      <h2 id="titlu-faq" style="font-family:var(--font-titlu);color:var(--visineu);font-size:1.15rem;margin-bottom:14px">
        &#10067; &#206;ntreb&#259;ri frecvente
      </h2>
      {faq_html}
    </section>
    <section style="margin-top:24px;background:white;border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:16px">
      <h2 style="font-family:var(--font-titlu);color:var(--visineu);font-size:1rem;margin-bottom:12px">&#128591; Alte rug&#259;ciuni ortodoxe</h2>
      {NAV_GRID}
    </section>
  </article>
</main>
{FOOTER}
{BOTTOM_NAV}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="/js/app.js"></script>
<script>
function copieTextRugaciune(){{
  var el=document.getElementById('text-rugaciune');
  navigator.clipboard.writeText(el.innerText).then(function(){{afiseazaToast('Rug&#259;ciunea a fost copiat&#259;!');}});
}}
function trimiteWhatsApp(){{
  var el=document.getElementById('text-rugaciune');
  var t=encodeURIComponent('{esc(titlu)}\\n\\n'+el.innerText.substring(0,800)+'...\\n\\nhttps://povestidecredinta.ro/rugaciuni/{slug}/');
  window.open('https://wa.me/?text='+t,'_blank');
}}
function toggleFaq(i){{
  var b=document.getElementById('fb'+i),ic=document.getElementById('fi'+i);
  if(b.style.display==='none'){{b.style.display='block';ic.textContent='-';}}
  else{{b.style.display='none';ic.textContent='+';}}
}}
</script>
</body>
</html>'''
    return html

# Generare
for r in data:
    slug = r["slug"]
    d = f"{BASE}/rugaciuni/{slug}"
    os.makedirs(d, exist_ok=True)
    with open(f"{d}/index.html", "w", encoding="utf-8") as f:
        f.write(gen_page(r))
    print(f"OK /rugaciuni/{slug}/index.html")

print(f"\nGata! {len(data)} pagini generate.")
