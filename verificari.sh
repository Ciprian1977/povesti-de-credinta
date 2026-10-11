#!/bin/bash
# Faza 1b — verificari DOAR DE CITIRE. Nu scrie nimic in productie.
set -u
B=https://www.povestidecredinta.ro
UA="Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36 povestidecredinta-audit"
mkdir -p out/pagini
st(){ curl -s -o /dev/null -A "$UA" -w "%{http_code} %{content_type} %{size_download} %{redirect_url}" --max-time 30 "$1"; }

echo "== 404 reale ==" > out/http.txt
for p in /pagina-care-nu-exista-12345 /sfinti/inexistent /calendar-ortodox/2026/10/11 /abc.html /rugaciuni/inexistenta; do echo "$p $(st $B$p)" >> out/http.txt; done
curl -s -A "$UA" "$B/pagina-care-nu-exista-12345" | grep -o '<title>[^<]*' >> out/http.txt
echo "== Fisiere care NU trebuie publice ==" >> out/http.txt
for p in /povesti-de-credinta-v1.zip /add_supabase_to_pages.py /gen_rugaciuni.py /scripts/genereaza-continut.js /scripts/package.json /.github/workflows/daily-content.yml /.env /.git/config /README.md /NOTIFICARI-SETUP.md /.vercelignore /vercel.json /data/lectionar.json /data/calendar.json /rugaciuni.json; do echo "$p $(st $B$p)" >> out/http.txt; done
echo "== Redirecturi domeniu ==" >> out/http.txt
for u in http://povestidecredinta.ro/ https://povestidecredinta.ro/ http://www.povestidecredinta.ro/ https://www.povestidecredinta.ro/index.html https://www.povestidecredinta.ro/calendar.html https://www.povestidecredinta.ro/calendar/; do echo "$u $(st $u)" >> out/http.txt; done
echo "== PWA ==" >> out/http.txt
for p in /manifest.json /sw.js /offline.html /onesignal/OneSignalSDKWorker.js /images/icon-192.png /images/icon-512.png /robots.txt /sitemap.xml /llms.txt; do echo "$p $(st $B$p)" >> out/http.txt; done
curl -s -A "$UA" $B/manifest.json > out/manifest.json
for i in $(python3 -c "import json;print(' '.join(x['src'] for x in json.load(open('out/manifest.json'))['icons']))"); do echo "icon $i $(st $B$i)" >> out/http.txt; done

echo "== Antete securitate ==" > out/antete.txt
curl -sI -A "$UA" $B/ >> out/antete.txt
echo | openssl s_client -servername www.povestidecredinta.ro -connect www.povestidecredinta.ro:443 2>/dev/null | openssl x509 -noout -issuer -dates >> out/antete.txt

echo "== Pagini din sitemap ==" > out/sitemap.txt
while read -r u; do
  f=out/pagini/$(echo "$u" | sed 's#https://www.povestidecredinta.ro##; s#/#_#g; s#^$#_#').html
  code=$(curl -s -A "$UA" -o "$f" -w "%{http_code}" --max-time 30 "$u")
  echo "$code $u" >> out/sitemap.txt
  sleep 0.3
done < urls.txt

echo "== Supabase (cheia publica anon din sit) ==" > out/supabase.txt
SB=https://smuqpipxeotkbttolivp.supabase.co
K=sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk
H=(-H "apikey: $K" -H "Authorization: Bearer $K")
curl -s "$SB/rest/v1/" "${H[@]}" -o out/openapi.json -w "openapi %{http_code}\n" >> out/supabase.txt
python3 - >> out/supabase.txt <<'PY'
import json
try:
  d=json.load(open('out/openapi.json'))
  for p,v in d.get('paths',{}).items(): print('expus:', p, sorted(v.keys()))
except Exception as e: print('openapi nelizibil', e, open('out/openapi.json').read()[:300])
PY
echo "-- citire 1 rand" >> out/supabase.txt
curl -s "$SB/rest/v1/zile_ortodoxe?select=data_calendaristica&limit=1" "${H[@]}" -w " HTTP %{http_code}\n" >> out/supabase.txt
echo "-- test scriere NEDISTRUCTIV: INSERT cu o data care EXISTA deja (RLS sau cheia unica refuza; nimic nu se scrie), plus tx=rollback" >> out/supabase.txt
curl -s -X POST "$SB/rest/v1/zile_ortodoxe" "${H[@]}" -H "Content-Type: application/json" -H "Prefer: return=minimal, tx=rollback" -d '{"data_calendaristica":"2026-10-11"}' -w " HTTP %{http_code}\n" >> out/supabase.txt
echo "-- test UPDATE pe o data inexistenta (0 randuri), tx=rollback" >> out/supabase.txt
curl -s -X PATCH "$SB/rest/v1/zile_ortodoxe?data_calendaristica=eq.1900-01-01" "${H[@]}" -H "Content-Type: application/json" -H "Prefer: return=representation, tx=rollback" -d '{"sfant_nume":"x"}' -w " HTTP %{http_code}\n" >> out/supabase.txt
echo "-- verificare dupa: randul 2026-10-11 neschimbat" >> out/supabase.txt
curl -s "$SB/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-10-11&select=data_calendaristica,sfant_nume" "${H[@]}" | cut -c1-200 >> out/supabase.txt; echo >> out/supabase.txt
echo "-- coloane (lungimi)" >> out/supabase.txt
curl -s "$SB/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-10-11&select=*" "${H[@]}" | python3 -c "import json,sys;d=json.load(sys.stdin);print({k:(len(str(v)) if v else 0) for k,v in d[0].items()})" >> out/supabase.txt
echo "-- numar zile in tabel" >> out/supabase.txt
curl -s -I "$SB/rest/v1/zile_ortodoxe?select=data_calendaristica" "${H[@]}" -H "Prefer: count=exact" -H "Range: 0-0" | grep -i content-range >> out/supabase.txt
curl -s "$SB/rest/v1/zile_ortodoxe?select=data_calendaristica,sfant_nume,evanghelie_carte,evanghelie_versete,tip_post,cuvant_folos,actualizat_la,creat_la&order=data_calendaristica.asc" "${H[@]}" > out/zile.json
curl -s "$SB/rest/v1/zile_ortodoxe?select=data_calendaristica,sfant_nume,evanghelie_carte,evanghelie_versete,tip_post,cuvant_folos&order=data_calendaristica.asc" "${H[@]}" > out/zile2.json

echo "== PageSpeed (mobil) ==" > out/psi.txt
for u in / /calendar /rugaciuni/tatal-nostru /sfanta-parascheva; do
  n=$(echo "$u" | tr '/' '_')
  curl -s --max-time 150 "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$B$u&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices" -o out/psi$n.json
  python3 - "$u" "out/psi$n.json" >> out/psi.txt <<'PY'
import json,sys
u,f=sys.argv[1],sys.argv[2]
try:
  d=json.load(open(f)); lr=d['lighthouseResult']; c=lr['categories']; a=lr['audits']
  print(u, {k:round(v['score']*100) for k,v in c.items()}, 'LCP',a['largest-contentful-paint']['displayValue'],'CLS',a['cumulative-layout-shift']['displayValue'],'TBT',a['total-blocking-time']['displayValue'],'FCP',a['first-contentful-paint']['displayValue'])
  le=d.get('loadingExperience',{}); print('  date reale CrUX:', le.get('overall_category'), {k:v.get('category') for k,v in le.get('metrics',{}).items()})
except Exception as e: print(u,'eroare',e, open(f).read()[:300])
PY
done
echo gata
