// Încărcat cu `node -r` ÎNAINTE de scripts/trimite-notificari.js, doar în teste.
// Înlocuiește complet rețeaua: nicio cerere nu pleacă spre OneSignal sau Supabase.
// - Supabase răspunde cu rândul din PDC_TEST_ZI (JSON) sau [] dacă lipsește.
// - OneSignal răspunde ca la o programare reușită; corpul cererii se salvează în PDC_TEST_JURNAL.
// - Ceasul este fixat la PDC_TEST_ACUM, ca orele programate să fie mereu aceleași.
const fs = require('fs');

const ACUM = Date.parse(process.env.PDC_TEST_ACUM || '2026-10-14T00:30:00Z');
const DateReal = Date;
class DateFix extends DateReal {
  constructor(...a) { if (a.length) super(...a); else super(ACUM); }
  static now() { return ACUM; }
}
global.Date = DateFix;

const JURNAL = process.env.PDC_TEST_JURNAL;
const ZI = process.env.PDC_TEST_ZI ? JSON.parse(process.env.PDC_TEST_ZI) : null;
const raspuns = (status, corp) => ({ ok: status < 300, status, json: async () => corp });

global.fetch = async (url, opt = {}) => {
  const u = String(url);
  const metoda = (opt.method || 'GET').toUpperCase();
  fs.appendFileSync(JURNAL, JSON.stringify({ url: u, metoda, corp: opt.body ? JSON.parse(opt.body) : null }) + '\n');
  if (u.includes('/rest/v1/zile_ortodoxe')) return raspuns(200, ZI ? [ZI] : []);
  if (u.includes('onesignal.com')) {
    if (metoda !== 'POST') return raspuns(405, { errors: ['doar POST este simulat'] });
    const c = opt.body ? JSON.parse(opt.body) : {};
    return raspuns(200, { id: 'simulat-' + (c.idempotency_key || 'acum'), recipients: 1 });
  }
  throw new Error('Cerere de rețea neașteptată în test: ' + u);
};
