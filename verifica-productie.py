# DOAR CITIRE: Lighthouse (mobil) pe producție, de 3 ori, pentru pagina principală + 2 pagini. Nicio scriere.
import subprocess, json, os, shutil
os.makedirs('out/lh', exist_ok=True); L=[]
chrome = shutil.which('google-chrome') or shutil.which('chromium')
for path in ['/', '/', '/', '/rugaciuni/rugaciunea-serii', '/acatiste/maica-domnului']:
    i=len(L); f=f'out/lh/r{i}.json'
    subprocess.run(['npx','-y','lighthouse@12.2.1','https://www.povestidecredinta.ro'+path,'--only-categories=performance','--output=json',f'--output-path={f}','--quiet',f'--chrome-path={chrome}','--chrome-flags=--headless=new --no-sandbox'],timeout=240)
    try: d=json.load(open(f))
    except Exception as e: L.append(f'{path}: eroare {e}'); continue
    a=d['audits']; s=lambda k:a[k].get('displayValue','')
    L.append(f"{path}: scor={round(d['categories']['performance']['score']*100)} FCP={s('first-contentful-paint')} LCP={s('largest-contentful-paint')} SI={s('speed-index')} TBT={s('total-blocking-time')}")
    if i==0:
        for k in ['render-blocking-insight','render-blocking-resources','network-dependency-tree-insight','lcp-discovery-insight','lcp-phases-insight','largest-contentful-paint-element','cache-insight','uses-long-cache-ttl','font-display-insight','server-response-time','redirects','third-parties-insight']:
            if k in a: L.append(f'  [{k}] {a[k].get("displayValue","")} {json.dumps(a[k].get("details",{}),ensure_ascii=False)[:1500]}')
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
