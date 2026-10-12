#!/usr/bin/env node
// Test pentru măsura provizorie „fără informații despre post în notificări”.
// Rulează scripts/trimite-notificari.js cu rețeaua simulată (scripts/teste/simulare-retea.js):
// NU trimite nimic la OneSignal și NU citește Supabase.
//
//   node scripts/teste/test-notificari-fara-post.js [cale/catre/trimite-notificari.js]
//
// Fără argument testează versiunea din acest PR. Cu argument se poate testa versiunea veche, pentru comparație.
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'trimite-notificari.js'));
const PRELOAD = path.join(__dirname, 'simulare-retea.js');
const INTERZIS = /\b(post|postul|postului|posturi|posturile|posturilor|dezleg\w*|har[țţt]i)\b|\/posturi\b/i;

function ruleaza(argumente, zi, acum, caleCalendar) {
  const jurnal = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pdc-')), 'retea.jsonl');
  fs.writeFileSync(jurnal, '');
  const r = spawnSync(process.execPath, ['-r', PRELOAD, SCRIPT, ...argumente], {
    encoding: 'utf8',
    env: {
      PATH: process.env.PATH,
      ONESIGNAL_APP_ID: 'app-test', ONESIGNAL_API_KEY: 'cheie-falsa-de-test',
      SUPABASE_URL: 'https://supabase.test', SUPABASE_SERVICE_KEY: 'cheie-falsa-de-test',
      PDC_TEST_JURNAL: jurnal, PDC_TEST_ZI: zi ? JSON.stringify(zi) : '', PDC_TEST_ACUM: acum || '2026-10-14T00:30:00Z',
      // implicit: fără calendarul validat (testele de filtrare verifică numele venite din Supabase)
      PDC_CALENDAR_VALIDAT: caleCalendar || '/nu-exista/calendar.json'
    }
  });
  const cereri = fs.readFileSync(jurnal, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const trimise = cereri.filter((c) => c.url.includes('onesignal.com')).map((c) => c.corp);
  return { cod: r.status, iesire: (r.stdout || '') + (r.stderr || ''), trimise };
}

const textNotificare = (p) => [p.headings, p.contents, p.subtitle, p.data]
  .map((x) => (x && typeof x === 'object') ? Object.values(x).join(' ') : (x || '')).join(' | ') + ' | ' + (p.web_url || p.url || '');
const tintesteAlertePost = (p) => JSON.stringify(p.filters || []).includes('"alerte_post');

const ZILE = {
  dezlegare: { data_calendaristica: '2026-10-14', sfant_nume: 'Sf. Cuv. Parascheva (Dezlegare la pește)', tip_post: 'dezlegare_peste', post_info: 'Dezlegare la pește' },
  post: { data_calendaristica: '2026-10-14', sfant_nume: 'Sf. Cuv. Parascheva', tip_post: 'post', post_info: 'Zi de post' },
  inceputPost: { data_calendaristica: '2026-11-15', sfant_nume: 'Începutul Postului Nașterii Domnului; Sf. Mc. Gurie, Samona și Aviv', tip_post: 'post', post_info: 'Post' },
  harti: { data_calendaristica: '2026-12-25', sfant_nume: 'Nașterea Domnului (Crăciunul. Harți)', tip_post: 'dezlegare', post_info: 'Harți' },
  apostol: { data_calendaristica: '2026-11-30', sfant_nume: 'Sf. Ap. Andrei, cel întâi chemat, ocrotitorul României', tip_post: 'dezlegare_peste' },
  postitorul: { data_calendaristica: '2026-09-02', sfant_nume: 'Sf. Ioan Postitorul, Patriarhul Constantinopolului', tip_post: null }
};

const rezultate = [];
function verifica(nume, conditie, detaliu) { rezultate.push({ nume, ok: !!conditie, detaliu: conditie ? '' : (detaliu || '') }); }

function verificariComune(eticheta, r) {
  const cuPost = r.trimise.filter((p) => INTERZIS.test(textNotificare(p)));
  verifica(`${eticheta}: nicio notificare nu menționează postul/dezlegarea/harțile (titlu, mesaj, date, link)`, cuPost.length === 0,
    cuPost.map(textNotificare).slice(0, 3).join(' || '));
  verifica(`${eticheta}: nicio notificare către abonații „alerte post”`, !r.trimise.some(tintesteAlertePost),
    `${r.trimise.filter(tintesteAlertePost).length} trimise`);
}

// 1–3. Programarea zilnică (rularea automată de la 01:30 UTC), pe zile de dezlegare, de post și de început de post
for (const [cheie, zi] of [['dezlegare', ZILE.dezlegare], ['post', ZILE.post], ['inceputPost', ZILE.inceputPost], ['harti', ZILE.harti]]) {
  const r = ruleaza(['programeaza', zi.data_calendaristica], zi, `${zi.data_calendaristica}T00:30:00Z`);
  verificariComune(`programeaza ${zi.data_calendaristica} (${cheie})`, r);
  verifica(`programeaza ${cheie}: rularea se termină fără eroare`, r.cod === 0, r.iesire.slice(-400));
  const pe = (s) => r.trimise.filter((p) => JSON.stringify(p.filters).includes(`"key":"${s}"`)).length;
  verifica(`programeaza ${cheie}: 9 notificări de dimineață, 7 de prânz, 9 de seară (neschimbat)`,
    pe('dimineata') === 9 && pe('pranz') === 7 && pe('seara') === 9 && r.trimise.length === 25,
    `dimineata=${pe('dimineata')} pranz=${pe('pranz')} seara=${pe('seara')} total=${r.trimise.length}`);
  verifica(`programeaza ${cheie}: fiecare notificare e programată (send_after) și are cheie anti-dublură`,
    r.trimise.every((p) => p.send_after && p.idempotency_key));
}

// 4. Sfântul zilei rămâne în titlul de dimineață
{
  const r = ruleaza(['programeaza', '2026-10-14'], ZILE.dezlegare, '2026-10-14T00:30:00Z');
  const dim = r.trimise.find((p) => JSON.stringify(p.filters).includes('"key":"dimineata"'));
  verifica('dimineață: titlul păstrează sfântul, fără „(Dezlegare la pește)”', dim && dim.headings.ro === '☀️ Sf. Cuv. Parascheva', dim && dim.headings.ro);
  verifica('dimineață: mesajul păstrează data zilei', dim && /14 octombrie/.test(dim.contents.ro), dim && dim.contents.ro);
  verifica('dimineață: mesajul nu mai pomenește „cuvântul de folos” (ascuns de PR #5)', dim && !/cuv[âa]ntul de folos/i.test(dim.contents.ro), dim && dim.contents.ro);
  verifica('nicio notificare din zi nu primește titlul neutru „Calendar ortodox”', !r.trimise.some((p) => /Calendar ortodox/.test(p.headings.ro)));
}
{
  const r = ruleaza(['programeaza', '2026-11-30'], ZILE.apostol, '2026-11-30T00:30:00Z');
  const dim = r.trimise.find((p) => JSON.stringify(p.filters).includes('"key":"dimineata"'));
  verifica('„Sf. Ap. Andrei” nu e confundat cu „post” (Apostol)', dim && dim.headings.ro.startsWith('☀️ Sf. Ap. Andrei'), dim && dim.headings.ro);
}
{
  const r = ruleaza(['programeaza', '2026-09-02'], ZILE.postitorul, '2026-09-02T00:30:00Z');
  const dim = r.trimise.find((p) => JSON.stringify(p.filters).includes('"key":"dimineata"'));
  verifica('„Sf. Ioan Postitorul” (nume de sfânt) rămâne în titlu', dim && dim.headings.ro.includes('Ioan Postitorul'), dim && dim.headings.ro);
}
{
  const r = ruleaza(['programeaza', '2026-11-15'], ZILE.inceputPost, '2026-11-15T00:30:00Z');
  const dim = r.trimise.find((p) => JSON.stringify(p.filters).includes('"key":"dimineata"'));
  verifica('„Începutul Postului …; Sf. Mc. Gurie …”: dispare doar mențiunea postului, sfinții rămân în titlu',
    dim && dim.headings.ro === '☀️ Sf. Mc. Gurie, Samona și Aviv', dim && dim.headings.ro);
}

// 5. Fără date în Supabase: notificarea generală pleacă, cu „Sfinții zilei”
{
  const r = ruleaza(['programeaza', '2026-10-14'], null, '2026-10-14T00:30:00Z');
  verificariComune('programeaza fără date', r);
  verifica('fără date în Supabase: titlul „Sfinții zilei”', r.trimise.some((p) => p.headings && p.headings.ro === '☀️ Sfinții zilei'));
}

// 6. Rulare repetată (inclusiv „Re-run” din GitHub): aceleași chei anti-dublură
{
  const a = ruleaza(['programeaza', '2026-10-14'], ZILE.dezlegare, '2026-10-14T00:30:00Z');
  const b = ruleaza(['programeaza', '2026-10-14'], ZILE.dezlegare, '2026-10-14T00:30:00Z');
  const ka = a.trimise.map((p) => p.idempotency_key).join(), kb = b.trimise.map((p) => p.idempotency_key).join();
  verifica('a doua rulare în aceeași zi folosește aceleași chei (OneSignal nu dublează)', ka && ka === kb);
}

// 7. Trimiteri manuale (Actions → Run workflow): test, dimineata, pranz, seara, alerte_post
for (const seg of ['test', 'dimineata', 'pranz', 'seara']) {
  const r = ruleaza([seg, '2026-10-14'], ZILE.dezlegare, '2026-10-14T06:00:00Z');
  verificariComune(`trimitere manuală „${seg}”`, r);
  verifica(`trimitere manuală „${seg}”: funcționează (o notificare)`, r.cod === 0 && r.trimise.length === 1, r.iesire.slice(-300));
  if (seg === 'test') {
    const p = r.trimise[0] || {};
    verifica('notificarea de test își păstrează titlul și numele sfântului, fără dezlegare',
      p.headings && p.headings.ro.startsWith('🔔 Test') && /Azi: Sf\. Cuv\. Parascheva\.$/.test(p.contents.ro), JSON.stringify([p.headings, p.contents]));
  }
}
{
  const r = ruleaza(['alerte_post', '2026-10-14'], ZILE.post, '2026-10-14T06:00:00Z');
  verifica('trimitere manuală „alerte_post”: nu pleacă nimic spre OneSignal', r.trimise.length === 0, `${r.trimise.length} trimise`);
  verifica('trimitere manuală „alerte_post”: se oprește fără eroare și explică de ce', r.cod === 0 && /oprit provizoriu/.test(r.iesire), r.iesire.slice(-300));
}

// 8. Filtrul de text, pe denumiri reale din calendarul BOR 2026: scoate DOAR mențiunea despre post
{
  const src = fs.readFileSync(SCRIPT, 'utf8');
  const a = src.indexOf('const CUV_POST'), b = src.indexOf('// Ultima plasă');
  if (a < 0 || b < 0) verifica('filtrul de text există în script', false, 'funcția faraPost lipsește');
  else {
    const { faraPost } = new Function(src.slice(a, b) + ';return { faraPost };')();
    const CAZURI = [
      ['Nașterea Domnului (Crăciunul. Harți)', 'Nașterea Domnului (Crăciunul)'],
      ['Sf. Proroc Naum; Sf. Filaret cel Milostiv (Tedeum. Dezlegare la pește)', 'Sf. Proroc Naum; Sf. Filaret cel Milostiv (Tedeum)'],
      ['(†) Intrarea în biserică a Maicii Domnului (Dezlegare la pește)', '(†) Intrarea în biserică a Maicii Domnului'],
      ['Sf. Mc. Zenaida (Lăsatul secului pentru Postul Sf. Ap. Petru și Pavel)', 'Sf. Mc. Zenaida'],
      ['Aducerea moaştelor Sf. Mare Mc. Teodor Stratilat (Începutul Postului Sf. Ap. Petru și Pavel. Dezlegare la pește)', 'Aducerea moaştelor Sf. Mare Mc. Teodor Stratilat'],
      ['Sf. Ier. Leon cel Mare, episcopul Romei (Zi aliturgică. Dezlegare la brânză, lapte, ouă şi peşte)', 'Sf. Ier. Leon cel Mare, episcopul Romei (Zi aliturgică)'],
      ['Sf. Gorgonia (Începutul Postului Sfintelor Paşti. Zi aliturgică. Canonul Mare)', 'Sf. Gorgonia (Zi aliturgică. Canonul Mare)'],
      ['Sf. Cuv. Sinclitichia (Ajunul Botezului Domnului. Post)', 'Sf. Cuv. Sinclitichia (Ajunul Botezului Domnului)'],
      ['(†) Înălțarea Sfintei Cruci (Post)', '(†) Înălțarea Sfintei Cruci'],
      ['Sf. Mc. Anisia fecioara (Harți)', 'Sf. Mc. Anisia fecioara'],
      // fără mențiune de post → textul rămâne identic
      ['Sf. Mc. Agapie, Plisie şi Timolau; Duminica a 3-a din Post (a Sfintei Cruci)', 'Sf. Mc. Agapie, Plisie şi Timolau; Duminica a 3-a din Post (a Sfintei Cruci)'],
      ['Ev. Matei 6, 14-21 (Învățătură despre iertare, post și neagonisire)', 'Ev. Matei 6, 14-21 (Învățătură despre iertare, post și neagonisire)'],
      ['Sf. Ioan Postitorul, Patriarhul Constantinopolului', 'Sf. Ioan Postitorul, Patriarhul Constantinopolului'],
      ['Sf. Ap. și Evanghelist Ioan Teologul; Sf. Cuv. Arsenie cel Mare', 'Sf. Ap. și Evanghelist Ioan Teologul; Sf. Cuv. Arsenie cel Mare'],
      ['Duminica Izgonirii lui Adam din Rai (a Lăsatului sec de brânză)', 'Duminica Izgonirii lui Adam din Rai (a Lăsatului sec de brânză)']
    ];
    for (const [intrare, asteptat] of CAZURI) {
      const iesire = faraPost(intrare);
      verifica(`filtru: „${intrare}”`, iesire === asteptat, `rezultat „${iesire}”, așteptat „${asteptat}”`);
    }
  }
}

// 9. Calendarul validat (oct.–dec. 2026): numele din notificări vin din calendar, nu din Supabase
{
  const CAL = path.join(__dirname, '..', '..', 'data', 'calendar-validat-2026-t4.json');
  if (!fs.existsSync(CAL)) verifica('fișierul calendarului validat există', false, CAL);
  else {
    const V = JSON.parse(fs.readFileSync(CAL, 'utf8')).zile;
    const dim = (r) => r.trimise.find((p) => JSON.stringify(p.filters || []).includes('"key":"dimineata"'));
    const dbGresit = (iso) => ({ data_calendaristica: iso, sfant_nume: 'Sf. Mc. Prov; Cinstirea Sfintei Icoane a Maicii Domnului din Kaluga; Sf. Lev de la Optina', tip_post: 'post' });
    let r = ruleaza(['programeaza', '2026-10-12'], dbGresit('2026-10-12'), '2026-10-12T00:30:00Z', CAL);
    verifica('12 oct.: titlul de dimineață = calendarul validat', dim(r) && dim(r).headings.ro === '☀️ Sf. Mc. Prov, Tarah și Andronic; Sf. Ier. Cosma, episcopul Maiumei', dim(r) && dim(r).headings.ro);
    verifica('12 oct.: numele din Supabase care nu sunt în calendar nu apar în nicio notificare', !r.trimise.some((p) => /Kaluga|Optina/.test(textNotificare(p))));
    verifica('12 oct.: programarea rămâne completă (25 de notificări)', r.cod === 0 && r.trimise.length === 25, `${r.trimise.length}`);
    r = ruleaza(['programeaza', '2026-11-30'], dbGresit('2026-11-30'), '2026-11-30T00:30:00Z', CAL);
    verifica('30 nov.: fără semnele de cruce și fără marcajul de dezlegare în titlu',
      dim(r) && dim(r).headings.ro === '☀️ Sf. Ap. Andrei cel întâi chemat, Ocrotitorul României; Sf. Ier. Andrei Șaguna, mitropolitul Transilvaniei; Sf. Ier. Frumentie, episcopul Etiopiei', dim(r) && dim(r).headings.ro);
    r = ruleaza(['programeaza', '2026-12-25'], null, '2026-12-25T00:30:00Z', CAL);
    verifica('25 dec., fără rând în Supabase: titlul „Nașterea Domnului” din calendar', dim(r) && dim(r).headings.ro === '☀️ Nașterea Domnului', dim(r) && dim(r).headings.ro);
    r = ruleaza(['programeaza', '2026-10-04'], dbGresit('2026-10-04'), '2026-10-04T00:30:00Z', CAL);
    verifica('duminică: titlul include și numele duminicii', dim(r) && dim(r).headings.ro.endsWith('; Duminica a 19-a după Rusalii'), dim(r) && dim(r).headings.ro);
    r = ruleaza(['programeaza', '2026-09-30'], { data_calendaristica: '2026-09-30', sfant_nume: 'Sf. Ier. Grigorie Luminătorul' }, '2026-09-30T00:30:00Z', CAL);
    verifica('zi în afara calendarului validat: se folosește numele din Supabase, ca înainte', dim(r) && dim(r).headings.ro === '☀️ Sf. Ier. Grigorie Luminătorul', dim(r) && dim(r).headings.ro);
    r = ruleaza(['test', '2026-10-14'], dbGresit('2026-10-14'), '2026-10-14T06:00:00Z', CAL);
    verifica('notificarea de test folosește și ea calendarul validat', r.trimise[0] && /Azi: Sf\. Cuv\. Parascheva de la Iași; Sf\. Mc\. Nazarie/.test(r.trimise[0].contents.ro), r.trimise[0] && r.trimise[0].contents.ro);
    let toate = [];
    for (const iso of Object.keys(V)) {
      const rr = ruleaza(['dimineata', iso], null, `${iso}T06:00:00Z`, CAL);
      if (rr.cod !== 0 || rr.trimise.length !== 1 || INTERZIS.test(textNotificare(rr.trimise[0])) || /†/.test(textNotificare(rr.trimise[0]))) toate.push(iso);
    }
    verifica(`toate cele ${Object.keys(V).length} zile: notificarea pleacă, fără post/dezlegare/harți și fără †`, toate.length === 0, toate.slice(0, 5).join(', '));
    r = ruleaza(['programeaza', '2026-10-12'], dbGresit('2026-10-12'), '2026-10-12T00:30:00Z', '/nu-exista/calendar.json');
    verifica('dacă fișierul lipsește: se folosește Supabase, fără eroare', r.cod === 0 && dim(r) && /Sf\. Mc\. Prov/.test(dim(r).headings.ro) && /Calendarul validat nu a putut fi citit/.test(r.iesire), r.iesire.slice(-200));
  }
}

// Regula OneSignal: „Message Notifications must have Any/English language content” (HTTP 400 la 12 oct. 2026, 07:30)
{
  const r = ruleaza(['programeaza', '2026-10-14'], ZILE.post, '2026-10-14T00:30:00Z');
  const faraEn = r.trimise.filter((p) => !(p.contents && p.contents.en) || !(p.headings && p.headings.en));
  verifica('fiecare notificare programată are titlu și text și în engleză (cerința OneSignal)', r.trimise.length > 0 && faraEn.length === 0,
    `${faraEn.length} din ${r.trimise.length} fără „en”`);
  const dim = r.trimise.find((p) => JSON.stringify(p.filters || []).includes('"dimineata"'));
  verifica('dimineața: textul „en” e același cu cel românesc', dim && dim.contents.en === dim.contents.ro && dim.headings.en === dim.headings.ro);
  for (const seg of ['test', 'dimineata', 'pranz', 'seara']) {
    const t = ruleaza([seg, '2026-10-14'], ZILE.post, '2026-10-14T06:00:00Z');
    verifica(`trimitere imediată „${seg}”: are text în engleză`, t.trimise[0] && t.trimise[0].contents.en && t.trimise[0].headings.en, JSON.stringify(t.trimise[0] && t.trimise[0].contents));
  }
}

// Raport
const picate = rezultate.filter((x) => !x.ok);
for (const x of rezultate) console.log(`${x.ok ? '✔' : '✘'} ${x.nume}${x.ok ? '' : '\n    → ' + x.detaliu}`);
console.log(`\n${rezultate.length - picate.length}/${rezultate.length} verificări trecute (script testat: ${path.relative(process.cwd(), SCRIPT)})`);
process.exit(picate.length ? 1 : 0);
