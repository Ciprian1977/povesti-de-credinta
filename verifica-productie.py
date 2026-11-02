# DOAR CITIRE: rândul din 2-6 noiembrie (cheie publică), pentru diagnostic sinaxar.
import os, json, urllib.request
os.makedirs('out',exist_ok=True)
K='sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk'
u='https://smuqpipxeotkbttolivp.supabase.co/rest/v1/zile_ortodoxe?data_calendaristica=gte.2026-11-01&data_calendaristica=lte.2026-11-08&select=data_calendaristica,sfant_nume,sinaxar,sfant_viata&order=data_calendaristica'
r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'apikey':K,'Authorization':'Bearer '+K}),timeout=30).read())
open('out/productie.txt','w').write(json.dumps(r,ensure_ascii=False,indent=1)); print(len(r))
