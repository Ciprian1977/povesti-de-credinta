# DOAR CITIRE: textele generate (predica, sinaxar, viața, tropar) pentru 1–12 oct. 2026, cu cheia publică a site-ului. Nicio scriere.
import json, urllib.request, re, os
src = open('/dev/null').read()
U = 'https://smuqpipxeotkbttolivp.supabase.co'
html = urllib.request.urlopen('https://www.povestidecredinta.ro/js/min/app.min.js?v=21', timeout=30).read().decode()
K = re.search(r'SUPABASE_ANON_KEY="([^"]+)"', html).group(1)
q = U + '/rest/v1/zile_ortodoxe?select=data_calendaristica,sfant_nume,predica,sinaxar,sfant_viata,tropar&data_calendaristica=gte.2026-10-01&data_calendaristica=lte.2026-10-13&order=data_calendaristica'
d = json.load(urllib.request.urlopen(urllib.request.Request(q, headers={'apikey': K, 'Authorization': 'Bearer ' + K}), timeout=30))
os.makedirs('out', exist_ok=True); json.dump(d, open('out/texte-oct.json', 'w'), ensure_ascii=False, indent=1)
open('out/productie.txt', 'w').write(f'{len(d)} zile: ' + ', '.join(r['data_calendaristica'] for r in d) + '\n')
