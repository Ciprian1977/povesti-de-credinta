// DOAR CITIRE: listează notificările OneSignal (nu trimite, nu anulează nimic).
const APP = process.env.ONESIGNAL_APP_ID, KEY = process.env.ONESIGNAL_API_KEY;
(async () => {
  if (!APP || !KEY) { console.log('lipsesc cheile'); process.exit(0); }
  const toate = [];
  for (let off = 0; off < 150; off += 50) {
    const r = await fetch(`https://onesignal.com/api/v1/notifications?app_id=${APP}&limit=50&offset=${off}`, { headers: { Authorization: `Key ${KEY}` } });
    const j = await r.json();
    if (!r.ok) { console.log('HTTP', r.status, JSON.stringify(j).slice(0, 300)); break; }
    toate.push(...(j.notifications || []));
    if (!j.notifications || j.notifications.length < 50) break;
  }
  const acum = Date.now() / 1000;
  const rez = toate.map(n => ({
    id: n.id, creat: n.queued_at ? new Date(n.queued_at * 1000).toISOString() : null,
    programat_pentru: n.send_after ? new Date(n.send_after * 1000).toISOString() : null,
    trimis: !!n.completed_at, anulat: !!n.canceled, in_asteptare: !n.completed_at && !n.canceled && (n.send_after || 0) > acum,
    titlu: (n.headings || {}).ro || (n.headings || {}).en || '', mesaj: (n.contents || {}).ro || (n.contents || {}).en || '',
    url: n.web_url || n.url || '', destinatari: n.successful, ramase: n.remaining,
    mentioneaza_postul: /post|dezleg|har[țt]i/i.test(((n.headings || {}).ro || '') + ' ' + ((n.contents || {}).ro || '') + ' ' + (n.web_url || ''))
  }));
  require('fs').writeFileSync('out/onesignal.json', JSON.stringify(rez, null, 1));
  const ast = rez.filter(x => x.in_asteptare);
  console.log(`total ${rez.length} | în așteptare ${ast.length} | în așteptare care menționează postul ${ast.filter(x => x.mentioneaza_postul).length} | trimise care menționau postul ${rez.filter(x => x.trimis && x.mentioneaza_postul).length}`);
})();
