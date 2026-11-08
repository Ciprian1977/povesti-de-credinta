# DOAR CITIRE: după #41.
import os, time, re, urllib.request
os.makedirs('out',exist_ok=True); time.sleep(30); L=[]
for u in ['/lasata-secului-postul-craciunului','/posturi/postul-craciunului-2026','/sitemap.xml','/']:
    try:
        r=urllib.request.urlopen('https://www.povestidecredinta.ro'+u+'?x='+str(time.time()),timeout=30); t=r.read().decode()
        m=re.search(r'<title[^>]*>([^<]*)',t)
        L.append(f"{u}: {r.status} {m.group(1)[:80] if m else ''} lasata={'lasata-secului-postul-craciunului' in t}")
    except Exception as e: L.append(f'{u}: EROARE {e}')
open('out/productie.txt','w').write('\n'.join(L)+'\n')
