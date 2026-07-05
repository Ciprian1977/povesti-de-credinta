/**
 * verifica-supabase.js
 * Verifică că datele au fost salvate corect în Supabase
 * Include validare pentru textele complete ale Apostolului și Evangheliei
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.log('⚠️  SUPABASE_SERVICE_KEY lipsește — skip verificare');
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  // Verifică ziua de mâine
  const maine = new Date();
  maine.setDate(maine.getDate() + 1);
  const dataStr = maine.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, sfant_nume, tip_post, apostol_carte, apostol_versete, apostol_text, evanghelie_carte, evanghelie_versete, evanghelie_text')
    .eq('data_calendaristica', dataStr)
    .single();

  if (error || !data) {
    console.error(`❌ Nu s-au găsit date pentru ${dataStr} în Supabase`);
    process.exit(1);
  }

  console.log('\n✅ Verificare Supabase — OK');
  console.log(`   Data: ${data.data_calendaristica}`);
  console.log(`   Sfânt: ${data.sfant_nume}`);
  console.log(`   Post: ${data.tip_post}`);
  console.log(`   Apostol: ${data.apostol_carte} ${data.apostol_versete}`);
  console.log(`   Evanghelie: ${data.evanghelie_carte} ${data.evanghelie_versete}`);

  // ── Validare texte complete ──────────────────────────────────────────────────
  let hasErrors = false;

  if (!data.apostol_text || data.apostol_text.length < 50 || data.apostol_text.startsWith('Ap. ')) {
    console.error(`❌ EROARE CRITICĂ: apostol_text este gol, prea scurt sau conține doar referința (nu textul complet)!`);
    console.error(`   Valoare actuală: "${data.apostol_text ? data.apostol_text.substring(0, 80) : 'null'}"`);
    hasErrors = true;
  } else {
    console.log(`   ✅ Apostol text: ${data.apostol_text.length} caractere (OK)`);
  }

  if (!data.evanghelie_text || data.evanghelie_text.length < 50 || data.evanghelie_text.startsWith('Ev. ')) {
    console.error(`❌ EROARE CRITICĂ: evanghelie_text este gol, prea scurt sau conține doar referința (nu textul complet)!`);
    console.error(`   Valoare actuală: "${data.evanghelie_text ? data.evanghelie_text.substring(0, 80) : 'null'}"`);
    hasErrors = true;
  } else {
    console.log(`   ✅ Evanghelie text: ${data.evanghelie_text.length} caractere (OK)`);
  }

  if (hasErrors) {
    console.error('\n❌ Verificare Supabase EȘUATĂ — textele sacre nu sunt complete!');
    process.exit(1);
  }

  // Verifică și câteva zile recente
  const { data: recent } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, sfant_nume')
    .order('data_calendaristica', { ascending: false })
    .limit(5);

  if (recent && recent.length > 0) {
    console.log('\n📅 Ultimele 5 zile în Supabase:');
    recent.forEach(r => console.log(`   ${r.data_calendaristica} — ${r.sfant_nume}`));
  }
}

main().catch(err => { console.error('❌', err); process.exit(1); });
