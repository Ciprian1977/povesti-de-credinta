// DOAR CITIRE: listează notificările OneSignal (nu trimite, nu anulează nimic).
// Încearcă ambele adrese ale API-ului și toate tipurile (kind 0 = panou, 1 = API, 3 = automate).
const APP = process.env.ONESIGNAL_APP_ID, KEY = process.env.ONESIGNAL_API_KEY;
const fs = require('fs');
(async () => {
  if (!APP || !KEY) { console.log('lipsesc cheile'); process.exit(0); }
  const diag = [];
  const SIT = '865e5cce-41f3-4136-a2c7-d6da9044a3ca'; // App ID public, din codul sitului
  diag.push(`secretul ONESIGNAL_APP_ID este identic cu App ID-ul din sit: ${APP.trim() === SIT ? 'DA' : 'NU'} (lungime ${APP.length}, spații la capete: ${APP !== APP.trim() ? 'DA' : 'nu'})`);
  diag.push(`tipul cheii REST: ${KEY.startsWith('os_v2_app_') ? 'cheie nouă de aplicație (os_v2_app_…)' : KEY.startsWith('os_v2_org_') ? 'cheie de organizație (os_v2_org_…)' : 'cheie veche/alt format'} (lungime ${KEY.length})`);
  const toate = new Map();
  const variante = [
    ['https://api.onesignal.com/notifications', ''],
    ['https://api.onesignal.com/notifications', '&kind=1'],
    ['https://api.onesignal.com/notifications', '&kind=0'],
    ['https://onesignal.com/api/v1/notifications', ''],
    ['https://onesignal.com/api/v1/notifications', '&kind=1']
  ];
  for (const [baza, extra] of variante) {
    for (let off = 0; off < 150; off += 50) {
      const r = await fetch(`${baza}?app_id=${APP}&limit=50&offset=${off}${extra}`, { headers: { Authorization: `Key ${KEY}`, Accept: 'application/json' } });
      let j = {}; try { j = await r.json(); } catch (e) {}
      const n = j.notifications || [];
      diag.push(`${baza.replace(/^https:\/\//, '')} ${extra || '(toate)'} offset=${off}: HTTP ${r.status}, total_count=${j.total_count}, primite=${n.length}${j.errors ? ', erori=' + JSON.stringify(j.errors).slice(0, 200) : ''}`);
      n.forEach((x) => toate.set(x.id, x));
      if (!r.ok || n.length < 50) break;
    }
  }
  const acum = Date.now() / 1000;
  const txt = (o) => (o && (o.ro || o.en)) || '';
  const rez = [...toate.values()].map((n) => ({
    id: n.id,
    creat: n.queued_at ? new Date(n.queued_at * 1000).toISOString() : null,
    programat_pentru: n.send_after ? new Date(n.send_after * 1000).toISOString() : null,
    trimis: !!n.completed_at, anulat: !!n.canceled,
    in_asteptare: !n.completed_at && !n.canceled && (n.send_after || 0) > acum,
    titlu: txt(n.headings), mesaj: txt(n.contents), url: n.web_url || n.url || '',
    destinatari: n.successful, ramase: n.remaining,
    mentioneaza_postul: /\b(post\w*|dezleg\w*|har[țţt]i)\b/i.test(txt(n.headings) + ' ' + txt(n.contents) + ' ' + (n.web_url || ''))
  })).sort((a, b) => String(b.programat_pentru).localeCompare(String(a.programat_pentru)));
  fs.writeFileSync('out/onesignal.json', JSON.stringify(rez, null, 1));
  fs.writeFileSync('out/diagnostic.txt', diag.join('\n') + '\n');
  diag.forEach((d) => console.log(d));
  const ast = rez.filter((x) => x.in_asteptare);
  console.log(`total ${rez.length} | în așteptare ${ast.length} | în așteptare care menționează postul ${ast.filter((x) => x.mentioneaza_postul).length} | trimise care menționau postul ${rez.filter((x) => x.trimis && x.mentioneaza_postul).length}`);
})();
