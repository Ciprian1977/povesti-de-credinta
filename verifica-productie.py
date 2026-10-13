# DOAR CITIRE: caută acatiste pe ro.wikisource. Nicio scriere.
import json, urllib.request, urllib.parse, os, time
UA={'User-Agent':'povestidecredinta-cercetare/1.0 (site povestidecredinta.ro)'}
def api(**p):
    p.update(format='json',formatversion=2)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request('https://ro.wikisource.org/w/api.php?'+urllib.parse.urlencode(p),headers=UA),timeout=60))
        except Exception as e: time.sleep(8*(i+1)); err=e
    raise err
os.makedirs('out/acat',exist_ok=True); L=[]; T=[]
for q in ['acatist','acatistul','"Apărătoare Doamnă"','"Bucură-te, Mireasă"','"Făcătorule al îngerilor"','"Iisuse preadulce"','"Sfinte Ierarhe Nicolae"','"făcătorule de minuni"','intitle:Acatist']:
    d=api(action='query',list='search',srsearch=q,srlimit=10,srnamespace='0|104|106'); time.sleep(3)
    r=[(x['title'],x['snippet'][:140]) for x in d['query']['search']]; L.append(f'== {q}: {len(r)}'); L+=[f'   {t} | {s}' for t,s in r]
    T+=[t for t,s in r if 'acatist' in (t+s).lower()]
d=api(action='query',list='allpages',apprefix='Acatist',aplimit=50); time.sleep(3); L.append('allpages Acatist*: '+str([x['title'] for x in d['query']['allpages']])); T+=[x['title'] for x in d['query']['allpages']]
for t in list(dict.fromkeys(T))[:8]:
    d=api(action='query',titles=t,prop='revisions|categories|templates',rvprop='content',rvslots='main',cllimit=50,tllimit=30); time.sleep(4); pg=d['query']['pages'][0]
    if 'revisions' in pg:
        w=pg['revisions'][0]['slots']['main']['content']; open('out/acat/'+t.replace('/','_')+'.wiki','w').write(w)
        L.append(f'## {t}: {len(w)} car.; cat={[c["title"] for c in pg.get("categories",[])]}; tpl={[x["title"] for x in pg.get("templates",[])][:10]}')
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
