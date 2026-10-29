# DOAR CITIRE: redirecționări www / fără www / .html / slash.
import urllib.request, os
os.makedirs('out',exist_ok=True); L=[]
class N(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*a,**k): return None
op=urllib.request.build_opener(N)
for u in ['https://povestidecredinta.ro/','https://povestidecredinta.ro/evanghelia-zilei','https://povestidecredinta.ro/evanghelia-zilei/','https://www.povestidecredinta.ro/evanghelia-zilei/','https://povestidecredinta.ro/faq.html','https://www.povestidecredinta.ro/faq.html','http://povestidecredinta.ro/','http://www.povestidecredinta.ro/sfantul-zilei','https://www.povestidecredinta.ro/rugaciuni-diminetii','https://www.povestidecredinta.ro/sfanta-parascheva/rugaciuni']:
    try:
        r=op.open(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20); L.append(f'{u} -> {r.status}')
    except urllib.error.HTTPError as e: L.append(f'{u} -> {e.code} {e.headers.get("Location")}')
    except Exception as e: L.append(f'{u} -> eroare {e}')
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
