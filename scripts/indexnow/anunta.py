"""IndexNow: anunță Bing (și celelalte motoare care folosesc IndexNow) când se schimbă pagini ale site-ului.
Cheia publică este în fișierul /2471b908229056566eb5ef6409e3d067.txt de la rădăcina site-ului (cerință IndexNow; nu e o parolă).
Folosire:
  python3 scripts/indexnow/anunta.py <fișier.html> [...]        anunță paginile acestor fișiere
  python3 scripts/indexnow/anunta.py --git <commit_vechi> <commit_nou>  anunță paginile HTML schimbate între două commit-uri
  --proba  arată doar ce s-ar trimite"""
import sys, json, subprocess, urllib.request
CHEIE = '2471b908229056566eb5ef6409e3d067'
GAZDA = 'www.povestidecredinta.ro'
EXCLUSE = {'offline.html', '404.html'}

def url_pentru(f):
    f = f.strip().lstrip('./')
    if not f.endswith('.html') or f in EXCLUSE or f.startswith(('scripts/', 'tests/', 'node_modules/', 'onesignal/')): return None
    if f == 'index.html': return f'https://{GAZDA}/'
    if f.endswith('/index.html'): return f'https://{GAZDA}/' + f[:-len('/index.html')]
    return f'https://{GAZDA}/' + f[:-len('.html')]

def main(a):
    proba = '--proba' in a; a = [x for x in a if x != '--proba']
    if a and a[0] == '--git':
        out = subprocess.run(['git', 'diff', '--name-only', '--diff-filter=AM', a[1], a[2]], capture_output=True, text=True).stdout.split()
    else: out = a
    urls = sorted({u for u in map(url_pentru, out) if u})
    if not urls: print('Nicio pagină de anunțat.'); return
    corp = {'host': GAZDA, 'key': CHEIE, 'keyLocation': f'https://{GAZDA}/{CHEIE}.txt', 'urlList': urls[:10000]}
    print(f'Anunț IndexNow pentru {len(urls)} pagini:'); [print('  ' + u) for u in urls]
    if proba: return
    req = urllib.request.Request('https://api.indexnow.org/indexnow', data=json.dumps(corp).encode(), headers={'Content-Type': 'application/json; charset=utf-8'})
    try:
        r = urllib.request.urlopen(req, timeout=30); print('Răspuns IndexNow:', r.status)
    except urllib.error.HTTPError as e:
        print('Răspuns IndexNow:', e.code, e.read()[:200])  # nu oprim publicarea pentru asta

if __name__ == '__main__':
    main(sys.argv[1:])
