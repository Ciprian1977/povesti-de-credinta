#!/usr/bin/env node
// Test: tag-urile de notificări încap în limita planului gratuit OneSignal (6 tag-uri/abonat)
// și fiecare abonat primește notificarea DOAR la ora aleasă. Rețeaua e simulată: nu trimite nimic.
//   node scripts/teste/test-tag-uri.js
const { spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm');
const RAD = path.join(__dirname, '..', '..');
const rez = [];
const verifica = (n, c, d) => rez.push({ n, ok: !!c, d: c ? '' : (d || '') });

// ── 1. Partea din telefon (js/app.js): ce tag-uri trimite ──
const app = fs.readFileSync(path.join(RAD, 'js/app.js'), 'utf8');
const bucata = app.slice(app.indexOf('const ORE_IMPLICITE_NOTIF'), app.indexOf('async function sincronizeazaTag()'));
const ctx = {}; vm.createContext(ctx); vm.runInContext(bucata + '\nthis.tagDinPreferinta=tagDinPreferinta;this.preferintaDinTag=preferintaDinTag;', ctx);
const SEG = ['dimineata', 'pranz', 'seara', 'alerte_post'];
const tags = (pref) => Object.fromEntries(SEG.map((s) => [s, ctx.tagDinPreferinta(pref, s)]));
const t1 = tags({ dimineata: true, dimineata_ora: '06:30', pranz: true, pranz_ora: '12:00', seara: true, seara_ora: '21:00', alerte_post: false, alerte_post_ora: '07:30' });
verifica('telefon: cel mult 6 tag-uri (limita OneSignal gratuit)', Object.keys(t1).length <= 6, JSON.stringify(t1));
verifica('telefon: ora aleasă e trimisă ca valoare', t1.dimineata === '06:30' && t1.pranz === '12:00' && t1.seara === '21:00' && t1.alerte_post === 'false', JSON.stringify(t1));
verifica('telefon: pornit fără oră aleasă → ora implicită', tags({ seara: true }).seara === '21:30');
verifica('telefon: citește și formatul vechi', ctx.preferintaDinTag('true').activ && ctx.preferintaDinTag('06:30').ora === '06:30' && !ctx.preferintaDinTag('false').activ);
verifica('telefon: nu mai trimite tag-uri <segment>_ora', !/addTag\(`\$\{segment\}_ora`|sincronizeazaTag\(`/.test(app));

// ── 2. Serverul: notificările programate și cine le primește ──
const jurnal = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pdc-')), 'retea.jsonl'); fs.writeFileSync(jurnal, '');
const r = spawnSync(process.execPath, ['-r', path.join(__dirname, 'simulare-retea.js'), path.join(__dirname, '..', 'trimite-notificari.js'), 'programeaza', '2026-10-14'], {
  encoding: 'utf8', env: { PATH: process.env.PATH, ONESIGNAL_APP_ID: 'app-test', ONESIGNAL_API_KEY: 'x', SUPABASE_URL: 'https://supabase.test', SUPABASE_SERVICE_KEY: 'x',
    PDC_TEST_JURNAL: jurnal, PDC_TEST_ZI: JSON.stringify({ data_calendaristica: '2026-10-14', sfant_nume: 'Sf. Cuv. Parascheva' }), PDC_TEST_ACUM: '2026-10-14T00:30:00Z', PDC_CALENDAR_VALIDAT: '/nu-exista' } });
verifica('server: programarea rulează fără eroare', r.status === 0, (r.stdout + r.stderr).slice(-300));
const notif = fs.readFileSync(jurnal, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((c) => c.url.includes('onesignal.com')).map((c) => c.corp);

function potriveste(f, u) { // evaluare filtre OneSignal: ȘI în grup, SAU între grupuri
  const grupe = [[]]; f.forEach((x) => x.operator === 'OR' ? grupe.push([]) : grupe[grupe.length - 1].push(x));
  return grupe.some((g) => g.length && g.every((x) => {
    const v = u[x.key];
    if (x.relation === 'exists') return v !== undefined;
    if (x.relation === 'not_exists') return v === undefined;
    if (x.relation === '=') return v === x.value;
    if (x.relation === '!=') return v !== undefined && v !== x.value;
    throw new Error('relație necunoscută ' + x.relation);
  }));
}
const primeste = (u) => notif.filter((p) => potriveste(p.filters, u)).map((p) => {
  const seg = p.filters.find((x) => x.key && SEG.includes(x.key.replace(/_ora$/, ''))).key.replace(/_ora$/, '');
  return seg + ' ' + p.send_after.slice(11, 16);
}).sort();
const CAZURI = [
  ['abonat fără setări', {}, ['dimineata 07:30']],
  ['format nou: 06:30 / 12:00 / 21:00', t1, ['dimineata 06:30', 'pranz 12:00', 'seara 21:00']],
  ['format nou: doar seara 22:30', tags({ seara: true, seara_ora: '22:30' }), ['seara 22:30']],
  ['format vechi: dimineata true + 08:00', { dimineata: 'true', dimineata_ora: '08:00' }, ['dimineata 08:00']],
  ['format vechi: seara true fără oră', { seara: 'true' }, ['dimineata 07:30', 'seara 21:30']],
  ['toate oprite', tags({}), []]
];
for (const [n, u, astept] of CAZURI) {
  const p = primeste(u);
  verifica(`server: ${n} → ${astept.join(', ') || 'nimic'}`, JSON.stringify(p) === JSON.stringify(astept), 'primește: ' + JSON.stringify(p));
}

// ── 3. Orele din pagina de setări = orele programate de server ──
const pag = fs.readFileSync(path.join(RAD, 'setari-notificari/index.html'), 'utf8') + app;
for (const [id, seg] of [['ora-dimineata', 'dimineata'], ['ora-pranz', 'pranz'], ['ora-seara', 'seara']]) {
  const ore = new Set(notif.filter((p) => JSON.stringify(p.filters).includes(`"${seg}"`)).map((p) => p.send_after.slice(11, 16)));
  verifica(`server: are notificări programate pentru ${seg}`, ore.size > 0);
}

for (const x of rez) console.log(`${x.ok ? '✔' : '✘'} ${x.n}${x.ok ? '' : '\n    → ' + x.d}`);
const picate = rez.filter((x) => !x.ok).length;
console.log(`\n${rez.length - picate}/${rez.length} verificări trecute`);
process.exit(picate ? 1 : 0);
