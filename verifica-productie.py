# DOAR CITIRE: imaginile noi (logo) pe site.
import urllib.request, hashlib, os, time
os.makedirs('out',exist_ok=True); L=[]; time.sleep(60)
for f in ['images/og-image.jpg','images/icon-192.png','images/icon-512.png','images/favicon.png','sw.js']:
    live=urllib.request.urlopen(urllib.request.Request('https://www.povestidecredinta.ro/'+f+'?v='+str(time.time()),headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
    main=urllib.request.urlopen('https://raw.githubusercontent.com/Ciprian1977/povesti-de-credinta/main/'+f,timeout=30).read()
    L.append(f"{f}: {len(live)} octeți, identic cu main={hashlib.sha1(live).hexdigest()==hashlib.sha1(main).hexdigest()}")
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
