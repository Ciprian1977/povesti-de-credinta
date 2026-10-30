# DOAR CITIRE: fișierul cheie IndexNow e accesibil pe site + test IndexNow (doar validare, o adresă).
import urllib.request, os, json
os.makedirs('out',exist_ok=True); L=[]
K='2471b908229056566eb5ef6409e3d067'
import time; time.sleep(60)
try:
    r=urllib.request.urlopen(f'https://www.povestidecredinta.ro/{K}.txt',timeout=20); b=r.read().decode().strip()
    L.append(f'cheie: HTTP {r.status} conținut_corect={b==K} tip={r.headers.get("content-type")}')
except Exception as e: L.append('cheie: eroare '+str(e))
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
