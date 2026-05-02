# ✝️ Povești de Credință — Calendar Ortodox Românesc

**povestidecredinta.ro** — Calendar ortodox, sfântul zilei, rugăciuni, acatiste și pricesne ortodoxe românești.

## 📁 Structura proiectului

```
povesti-de-credinta/
├── index.html                    # Homepage — Sfântul zilei
├── calendar.html                 # Calendar lunar
├── rugaciuni.html                # Rugăciuni ortodoxe
├── acatiste.html                 # Acatiste
├── pricesne.html                 # Pricesne ortodoxe
├── posturi.html                  # Posturi 2026
├── faq.html                      # Întrebări frecvente
├── despre.html                   # Despre noi (E-E-A-T)
├── contact.html                  # Contact
├── politica-confidentialitate.html
├── politica-cookies.html
├── offline.html                  # Pagina offline PWA
├── manifest.json                 # PWA manifest
├── sw.js                         # Service Worker
├── robots.txt                    # SEO
├── sitemap.xml                   # SEO
├── llms.txt                      # AI visibility
├── vercel.json                   # Configurare Vercel
├── css/
│   └── style.css                 # Design principal
├── js/
│   └── app.js                    # JavaScript principal
├── data/
│   └── calendar.json             # Date calendar ortodox 2026
└── images/                       # Iconițe PWA, favicon, OG image
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    ├── icon-512.png
    ├── badge-72.png
    ├── favicon.png
    └── og-image.jpg
```

## 🚀 Deploy pe Vercel

### Prima dată:
1. Creează repo pe GitHub: `povesti-de-credinta`
2. Copiază toate fișierele în repo
3. Pe [vercel.com](https://vercel.com) → **New Project** → Import repo GitHub
4. Vercel detectează automat că e site static
5. Click **Deploy** — gata!

### Deploy ulterior (după modificări):
```bash
git add .
git commit -m "Actualizare conținut"
git push origin main
```
Vercel face deploy automat în ~30 secunde.

### Conectare domeniu povestidecredinta.ro:
1. În Vercel → Project → **Settings** → **Domains**
2. Adaugă `povestidecredinta.ro`
3. Vercel îți dă nameservers
4. În panoul ROTLD/registrar → schimbă nameservers cu cele de la Vercel
5. Propagare: 24-48 ore

## 📱 PWA — Imagini necesare

Trebuie să creezi iconițele PWA. Cea mai simplă metodă:
1. Mergi la [pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Încarcă icoana Maicii Domnului (fond vișiniu)
3. Descarcă toate dimensiunile
4. Pune-le în folderul `/images/`

## 🔧 Faza 2 — Supabase (săptămâna 2)

Vom migra datele din `calendar.json` în Supabase pentru:
- Conținut generat automat zilnic cu Claude API
- Vieți de sfinți complete
- Tropare, sinaxar, evanghelia zilei
- Push notifications automate la 00:05

## 📊 Google Search Console

1. Mergi la [search.google.com/search-console](https://search.google.com/search-console)
2. Adaugă proprietatea `povestidecredinta.ro`
3. Verifică prin DNS (Vercel → Settings → DNS)
4. Submit sitemap: `https://povestidecredinta.ro/sitemap.xml`

## 🎯 AdSense

Înlocuiește în fișierele HTML comentariile AdSense cu codul real:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-CODUL_TAU"
     data-ad-slot="SLOT_ID"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

## ✝️ Credite

Conținut conform Sinaxarului Bisericii Ortodoxe Române.
© 2026 Povești de Credință — povestidecredinta.ro
