#!/bin/bash
# Faza 1b, partea 2 — doar citire
set -u
mkdir -p out
SB=https://smuqpipxeotkbttolivp.supabase.co
K=sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk
H=(-H "apikey: $K" -H "Authorization: Bearer $K")
echo "== RLS UPDATE (nedistructiv: scriem EXACT valoarea existenta, deci nimic nu se schimba chiar daca ar fi permis) ==" > out/rls2.txt
V=$(curl -s "$SB/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-05-03&select=culoare_liturgica" "${H[@]}" | python3 -c "import json,sys;print(json.load(sys.stdin)[0]['culoare_liturgica'])")
echo "valoare existenta: $V" >> out/rls2.txt
curl -s -X PATCH "$SB/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-05-03" "${H[@]}" -H "Content-Type: application/json" -H "Prefer: return=representation, tx=rollback" -d "{\"culoare_liturgica\":\"$V\"}" -w " HTTP %{http_code}\n" | cut -c1-200 >> out/rls2.txt
echo "== Lighthouse mobil (date de laborator) ==" > out/lh.txt
for u in / /calendar /rugaciuni/tatal-nostru /sfanta-parascheva /sfintii-zilei; do
  n=$(echo "$u" | tr '/' '_')
  npx -y lighthouse@12 "https://www.povestidecredinta.ro$u" --quiet --form-factor=mobile --screenEmulation.mobile --output=json --output-path=out/lh$n.json --chrome-flags="--headless=new --no-sandbox" >/dev/null 2>&1
  python3 - "$u" "out/lh$n.json" >> out/lh.txt <<'PY'
import json,sys
u,f=sys.argv[1],sys.argv[2]
try:
  d=json.load(open(f)); c=d['categories']; a=d['audits']
  print(u, {k:round((v['score'] or 0)*100) for k,v in c.items()}, '| LCP',a['largest-contentful-paint']['displayValue'],'| CLS',a['cumulative-layout-shift']['displayValue'],'| TBT',a['total-blocking-time']['displayValue'],'| FCP',a['first-contentful-paint']['displayValue'])
  ops=sorted([(x.get('details',{}).get('overallSavingsMs',0) or 0, k, x.get('displayValue','')) for k,x in a.items() if x.get('details',{}).get('type')=='opportunity'], reverse=True)[:4]
  print('   oportunitati:', ops)
  print('   esuate SEO/BP/A11y:', [k for k,x in a.items() if x.get('score') is not None and x['score']<0.9 and x.get('scoreDisplayMode')=='binary'][:12])
except Exception as e: print(u,'eroare',e)
PY
done
echo gata
