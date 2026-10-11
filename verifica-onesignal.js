// DOAR CITIRE: diagnostic OneSignal. Nu trimite notificări, nu anulează, nu modifică abonați sau tag-uri.
// 1) istoricul notificărilor (create / programate / trimise / anulate)
// 2) abonații și tag-urile lor (doar agregat; din ID-uri se păstrează doar primele 6 caractere)
// 3) câți abonați s-ar potrivi cu fiecare notificare programată de rularea zilnică (aceleași filtre ca în scripts/trimite-notificari.js)
const APP = process.env.ONESIGNAL_APP_ID, KEY = process.env.ONESIGNAL_API_KEY;
const fs = require('fs');
const zlib = require('zlib');
const H = { Authorization: `Key ${KEY}`, Accept: 'application/json' };
const out = [];
const log = (s) => { out.push(s); console.log(s); };

async function getJson(url, opt = {}) {
  const r = await fetch(url, { headers: H, ...opt });
  let j = null; try { j = await r.json(); } catch (e) {}
  return { status: r.status, j };
}

(async () => {
  if (!APP || !KEY) { log('lipsesc cheile'); return; }
  log(`App ID secret = App ID sit: ${APP.trim() === '865e5cce-41f3-4136-a2c7-d6da9044a3ca' ? 'DA' : 'NU'}`);

  // ── 1. Notificări ─────────────────────────────────────────────
  const n = await getJson(`https://api.onesignal.com/notifications?app_id=${APP}&limit=50`);
  const lista = (n.j && n.j.notifications) || [];
  const acum = Date.now() / 1000;
  log(`\n[1] Notificări în istoric: HTTP ${n.status}, total_count=${n.j && n.j.total_count}`);
  log(`    create=${lista.length} | programate (în așteptare)=${lista.filter((x) => !x.completed_at && !x.canceled && (x.send_after || 0) > acum).length} | trimise=${lista.filter((x) => x.completed_at).length} | anulate=${lista.filter((x) => x.canceled).length}`);
  lista.slice(0, 20).forEach((x) => log(`    ${x.id.slice(0, 8)} programat=${x.send_after ? new Date(x.send_after * 1000).toISOString() : '-'} trimis=${!!x.completed_at} anulat=${!!x.canceled} reușite=${x.successful} | ${((x.headings || {}).ro || '').slice(0, 60)}`));

  // ── 2. Abonați ───────────────────────────────────────────────
  let abonati = null;
  const p = await getJson(`https://onesignal.com/api/v1/players?app_id=${APP}&limit=300`);
  log(`\n[2a] Listare abonați (GET /players): HTTP ${p.status}${p.j && p.j.errors ? ' ' + JSON.stringify(p.j.errors).slice(0, 200) : ''}, total_count=${p.j && p.j.total_count}`);
  if (p.status === 200 && p.j && Array.isArray(p.j.players)) {
    abonati = p.j.players.map((x) => ({ id: x.id, tags: x.tags || {}, tip: x.device_type, abonat: (x.notification_types == null || x.notification_types > 0) && !x.invalid_identifier, creat: x.created_at, activ: x.last_active }));
  } else {
    // Export CSV (citire): OneSignal pregătește un fișier cu abonații; nu modifică nimic
    const e = await getJson(`https://onesignal.com/api/v1/players/csv_export?app_id=${APP}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ extra_fields: ['country'] }) });
    log(`[2b] Export CSV abonați: HTTP ${e.status}${e.j && e.j.errors ? ' ' + JSON.stringify(e.j.errors).slice(0, 200) : ''}`);
    const csvUrl = e.j && e.j.csv_file_url;
    if (csvUrl) {
      for (let i = 0; i < 18 && !abonati; i++) {
        await new Promise((r) => setTimeout(r, 10000));
        const r = await fetch(csvUrl);
        if (r.status !== 200) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        let txt; try { txt = zlib.gunzipSync(buf).toString('utf8'); } catch (er) { txt = buf.toString('utf8'); }
        abonati = parseCsv(txt);
      }
      if (!abonati) log('    exportul nu a fost gata în 3 minute');
    }
  }

  if (abonati) {
    const valizi = abonati.filter((a) => a.abonat);
    log(`\n[2] Abonamente: total=${abonati.length} | abonate activ=${valizi.length} | dezabonate/invalide=${abonati.length - valizi.length}`);
    abonati.forEach((a) => log(`    ${String(a.id).slice(0, 6)}… tip=${a.tip} abonat=${a.abonat} creat=${fmt(a.creat)} ultima_activitate=${fmt(a.activ)} tags=${JSON.stringify(a.tags)}`));

    // ── 3. Eligibilitate pentru programarea zilnică ─────────────
    const ORE = { dimineata: [jum(5, 0, 9, 0), '07:30'], pranz: [jum(11, 30, 14, 30), '13:00'], seara: [jum(19, 0, 23, 0), '21:30'], alerte_post: [jum(5, 0, 9, 0), '07:30'] };
    log('\n[3] Abonați care s-ar potrivi la programarea zilnică (filtre identice cu scriptul):');
    for (const [seg, [lista, impl]] of Object.entries(ORE)) {
      const potriviri = [];
      for (const ora of lista) {
        const c = valizi.filter((a) => potriveste(a.tags, seg, ora, impl)).length;
        if (c) potriviri.push(`${ora}→${c}`);
      }
      log(`    ${seg}: ${potriviri.length ? potriviri.join(', ') : 'niciun abonat eligibil la nicio oră'}`);
    }
  }
  fs.writeFileSync('out/diagnostic.txt', out.join('\n') + '\n');
})();

function potriveste(t, seg, ora, impl) {
  const activ = t[seg] === 'true';
  if (activ && t[`${seg}_ora`] === ora) return true;
  if (ora === impl && activ && t[`${seg}_ora`] == null) return true;
  if (ora === impl && seg === 'dimineata' && t.dimineata == null) return true;
  return false;
}
function jum(h1, m1, h2, m2) { const r = []; for (let t = h1 * 60 + m1; t <= h2 * 60 + m2; t += 30) r.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`); return r; }
function fmt(t) { if (!t) return '-'; const d = typeof t === 'number' ? new Date(t * 1000) : new Date(t); return isNaN(d) ? String(t) : d.toISOString().slice(0, 16); }
function parseCsv(txt) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"' && txt[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [cap, ...rest] = rows; const ix = (k) => cap.indexOf(k);
  return rest.filter((r) => r.length > 1).map((r) => {
    let tags = {}; try { tags = JSON.parse(r[ix('tags')] || '{}') || {}; } catch (e) {}
    const nt = r[ix('notification_types')];
    return { id: r[ix('id')], tags, tip: r[ix('device_type')], abonat: !(nt !== undefined && nt !== '' && Number(nt) <= 0) && r[ix('invalid_identifier')] !== 't' && r[ix('invalid_identifier')] !== 'true', creat: r[ix('created_at')], activ: r[ix('last_active')] };
  });
}
