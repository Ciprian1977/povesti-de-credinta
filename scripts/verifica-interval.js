/**
 * verifica-interval.js START END
 * Verifică în Supabase că fiecare zi din interval există și are conținut real
 * (nu doar textul de rezervă). Iese cu cod 1 dacă lipsește ceva.
 */
const { createClient } = require('@supabase/supabase-js');
const { lecturiZi } = require('./surse-doxologia');
const adnotare = (tip, linii) => { if (process.env.GITHUB_ACTIONS) console.log(`::${tip}::` + linii.join('%0A')); };

const [START, END] = process.argv.slice(2);
if (!START || !END) { console.error('Folosire: node verifica-interval.js YYYY-MM-DD YYYY-MM-DD'); process.exit(1); }

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, sfant_nume, sfant_viata, evanghelie_text, evanghelie_carte, evanghelie_versete, apostol_carte, apostol_versete')
    .gte('data_calendaristica', START)
    .lte('data_calendaristica', END)
    .order('data_calendaristica');
  if (error) { console.error('❌', error.message); process.exit(1); }

  const map = Object.fromEntries((data || []).map(r => [r.data_calendaristica, r]));
  const probleme = [];
  const bune = [];
  for (let d = new Date(START + 'T12:00:00Z'); d <= new Date(END + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    const k = d.toISOString().slice(0, 10);
    const r = map[k];
    if (!r) { probleme.push(`${k}: LIPSEȘTE`); continue; }
    const rezerva = !r.sfant_viata || /este prăznuit în calendarul ortodox pe \d{4}-/.test(r.sfant_viata)
      || !r.sfant_nume || r.sfant_nume.includes('conform Calendarului Ortodox BOR');
    if (rezerva) { probleme.push(`${k}: doar conținut de rezervă (${r.sfant_nume})`); continue; }
    let lect = '';
    try {
      const of = await lecturiZi(k, { cuText: false });
      if (of && of.evanghelie_versete) {
        const egal = (a, b) => String(a || '').replace(/\s+/g, '') === String(b || '').replace(/\s+/g, '');
        if (!egal(r.evanghelie_versete, of.evanghelie_versete) || !egal(r.evanghelie_carte, of.evanghelie_carte)) {
          probleme.push(`${k}: Evanghelia e ${r.evanghelie_carte} ${r.evanghelie_versete}, oficial ${of.evanghelie_carte} ${of.evanghelie_versete}`);
          continue;
        }
        lect = ` | Ap. ${r.apostol_carte} ${r.apostol_versete} | Ev. ${r.evanghelie_carte} ${r.evanghelie_versete} ✓`;
      }
    } catch (e) {}
    const linie = `✅ ${k} — ${String(r.sfant_nume).slice(0, 70)}${lect}`;
    console.log(linie); bune.push(linie);
  }
  if (bune.length) adnotare('notice', bune);
  if (probleme.length) {
    adnotare('error', probleme);
    console.error('\n❌ Probleme:\n  ' + probleme.join('\n  '));
    process.exit(1);
  }
  console.log('\n✅ Toate zilele din interval sunt complete.');
})();
