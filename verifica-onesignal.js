// DOAR CITIRE: diagnostic tag-uri OneSignal + versiunea din producție.
// Nu trimite notificări, nu modifică abonați, tag-uri sau setări. Doar cereri GET.
// ID-urile se afișează doar parțial (ultimele 6 caractere = „codul” afișat în pagina de setări).
const APP = process.env.ONESIGNAL_APP_ID, KEY = process.env.ONESIGNAL_API_KEY;
const fs = require('fs');
const crypto = require('crypto');
const H = { Authorization: `Key ${KEY}`, Accept: 'application/json' };
const out = [];
const log = (s) => { out.push(s); console.log(s); };
const cod = (id) => id ? '…' + String(id).slice(-6).toUpperCase() : '-';
async function get(url, hdr = H) {
  const r = await fetch(url, { headers: hdr });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) {}
  return { status: r.status, j, t };
}

(async () => {
  // ── A. Producție: ce versiune servește domeniul ───────────────
  log('[A] Producție www.povestidecredinta.ro');
  for (const f of ['sw.js', 'js/app.js', 'js/min/app.min.js', 'scripts/trimite-notificari.js']) {
    const r = await fetch('https://www.povestidecredinta.ro/' + f, { redirect: 'manual' });
    const b = Buffer.from(await r.arrayBuffer());
    const m = await fetch('https://raw.githubusercontent.com/Ciprian1977/povesti-de-credinta/main/' + f);
    const local = m.status === 200 ? crypto.createHash('sha1').update(Buffer.from(await m.arrayBuffer())).digest('hex').slice(0, 10) : '-';
    const live = crypto.createHash('sha1').update(b).digest('hex').slice(0, 10);
    log(`    /${f}: HTTP ${r.status} | live=${r.status === 200 ? live : '-'} | main=${local} | ${r.status === 200 && live === local ? 'IDENTIC cu main' : r.status === 200 ? 'DIFERIT' : ''}`);
  }
  const c = await fetch('https://www.povestidecredinta.ro/js/corectura-provizorie.js', { redirect: 'manual' });
  log(`    /js/corectura-provizorie.js (PR #5): HTTP ${c.status} (404 = PR #5 încă nepublicat)`);
  const h = await fetch('https://www.povestidecredinta.ro/', { redirect: 'manual' });
  log(`    antete: server=${h.headers.get('server')} x-vercel-cache=${h.headers.get('x-vercel-cache')} age=${h.headers.get('age')}`);

  if (!APP || !KEY) { log('lipsesc cheile OneSignal'); return fin(); }

  // ── B. Abonamente (vechiul API) ───────────────────────────────
  const p = await get(`https://onesignal.com/api/v1/players?app_id=${APP}&limit=300`);
  const players = (p.j && p.j.players) || [];
  log(`\n[B] Abonamente (GET /players): HTTP ${p.status}, total=${players.length}`);
  players.forEach((x) => log(`    cod ${cod(x.id)} tip=${x.device_type} notification_types=${x.notification_types} invalid=${x.invalid_identifier} sesiuni=${x.session_count} creat=${new Date(x.created_at * 1000).toISOString().slice(0, 16)} activ=${new Date(x.last_active * 1000).toISOString().slice(0, 16)} sdk=${x.sdk} tags(vechiul API)=${JSON.stringify(x.tags || {})}`));

  // ── C. Pentru fiecare abonament: utilizatorul OneSignal și tag-urile lui (noul API, v16) ──
  log('\n[C] Utilizatorul legat de fiecare abonament (noul API /users):');
  for (const x of players) {
    const idn = await get(`https://api.onesignal.com/apps/${APP}/subscriptions/${x.id}/user/identity`);
    const oid = idn.j && idn.j.identity && idn.j.identity.onesignal_id;
    log(`    cod ${cod(x.id)} → identitate HTTP ${idn.status}; chei identitate: ${idn.j && idn.j.identity ? Object.keys(idn.j.identity).join(',') : JSON.stringify(idn.j || idn.t).slice(0, 200)}`);
    if (!oid) continue;
    const u = await get(`https://api.onesignal.com/apps/${APP}/users/by/onesignal_id/${oid}`);
    const pr = (u.j && u.j.properties) || {};
    log(`      utilizator ${cod(oid)}: HTTP ${u.status}; tags=${JSON.stringify(pr.tags || {})}; nr_tag-uri=${Object.keys(pr.tags || {}).length}; limbă=${pr.language}; fus=${pr.timezone_id}; prima_activitate=${pr.first_active ? new Date(pr.first_active * 1000).toISOString().slice(0, 16) : '-'}; ultima=${pr.last_active ? new Date(pr.last_active * 1000).toISOString().slice(0, 16) : '-'}`);
    ((u.j && u.j.subscriptions) || []).forEach((s) => log(`      abonament ${cod(s.id)} tip=${s.type} activ=${s.enabled} notification_types=${s.notification_types} sdk=${s.sdk} device=${s.device_model || ''}`));
    if (u.status !== 200) log('      răspuns: ' + String(u.t).slice(0, 300));
  }
  // ── D. Notificări: create / programate / trimise + verificarea textului ──
  const n = await get(`https://api.onesignal.com/notifications?app_id=${APP}&limit=50`);
  const L = (n.j && n.j.notifications) || [];
  const acum = Date.now() / 1000;
  const RX = /(?<!\p{L})(?:[Pp]ost(?:ul|ului|uri|urile|urilor)|Post|[Dd]ezleg\p{L}*|[Hh]ar[țţt]i)(?!\p{L})|cuv[âa]ntul de folos|\/posturi/u;
  log(`\n[D] Notificări OneSignal: HTTP ${n.status}, total=${n.j && n.j.total_count} | programate=${L.filter((x) => !x.completed_at && !x.canceled && (x.send_after || 0) > acum).length} | trimise=${L.filter((x) => x.completed_at).length} | anulate=${L.filter((x) => x.canceled).length}`);
  L.forEach((x) => {
    const t = ((x.headings || {}).ro || '') + ' | ' + ((x.contents || {}).ro || '') + ' | ' + (x.web_url || '');
    log(`    ${x.id.slice(0, 8)} programat=${x.send_after ? new Date(x.send_after * 1000).toISOString().slice(0, 16) + 'Z' : '-'} trimis=${!!x.completed_at} anulat=${!!x.canceled} destinatari=${x.successful ?? '-'}/${x.remaining ?? '-'} | ${RX.test(t) ? '⚠️ CONȚINE post/dezlegare/cuvânt de folos' : 'text curat'} | ${t.slice(0, 90)} | filtre=${JSON.stringify(x.filters||x.included_segments||'').replace(/"field":"tag",|"relation":/g,'').slice(0,260)} | ok=${x.successful} err=${x.errored} fail=${x.failed} conv=${x.converted} recv=${JSON.stringify(x.platform_delivery_stats||{}).slice(0,160)}`);
  });
  fin();
})();
function fin() { fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/diagnostic.txt', out.join('\n') + '\n'); }
