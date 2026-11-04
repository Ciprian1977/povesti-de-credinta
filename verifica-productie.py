# DOAR CITIRE: după #36 – versiuni live.
import os, time, urllib.request
os.makedirs('out',exist_ok=True); time.sleep(60); L=[]
for u in ['/sw.js','/sinaxarul-zilei','/data/calendar-validat-2026-t4.json?v=3']:
    t=urllib.request.urlopen('https://www.povestidecredinta.ro'+u+('&' if '?' in u else '?')+'x='+str(time.time()),timeout=30).read().decode()
    L.append(f"{u}: v32={'-v32' in t} corectura11={'corectura-provizorie.js?v=11' in t} viata2nov={'Aftonie și Elpidifor au fost uciși' in t}")
open('out/productie.txt','w').write('\n'.join(L)+'\n')
