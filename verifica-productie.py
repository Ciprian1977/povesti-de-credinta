# DOAR CITIRE: rândul din baza de date pentru 27 oct (complet).
import json, urllib.request, os
os.makedirs('out', exist_ok=True)
U='https://smuqpipxeotkbttolivp.supabase.co/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-10-27&select=*'
K='sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk'
r=json.load(urllib.request.urlopen(urllib.request.Request(U,headers={'apikey':K,'Authorization':'Bearer '+K}),timeout=30))
json.dump(r,open('out/zi.json','w'),ensure_ascii=False,indent=1)
open('out/productie.txt','w').write(str(len(r))+' rânduri\n')
