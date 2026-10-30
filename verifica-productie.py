# DOAR CITIRE: HTML-ul brut (fără JavaScript) al paginilor de lecturi.
import urllib.request, re, os
os.makedirs('out',exist_ok=True); L=[]
for p in ['/evanghelia-zilei','/apostolul-zilei']:
    h=urllib.request.urlopen(urllib.request.Request('https://www.povestidecredinta.ro'+p,headers={'User-Agent':'Mozilla/5.0 (compatible; bingbot/2.0)'}),timeout=20).read().decode()
    t=re.search(r'<title[^>]*>([^<]*)',h).group(1)
    L.append(f'{p}: titlu={t!r} text_in_html={"lectura-sursa" in h} lungime={len(h)}')
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
