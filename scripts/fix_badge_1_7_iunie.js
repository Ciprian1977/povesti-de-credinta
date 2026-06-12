/**
 * fix_badge_1_7_iunie.js
 * Corectează badge-urile de post pentru 1-7 iunie 2026
 * 
 * Problema: Zilele 1-7 iunie 2026 sunt în Postul Apostolilor
 * dar au fost generate cu badge-uri greșite (dezlegare/post în loc de 
 * dezlegare_ulei/post_aspru/dezlegare_peste conform regulilor Postului Apostolilor)
 * 
 * Postul Apostolilor 2026: 1 Iunie (Luni) - 28 Iunie (Duminică)
 * Reguli:
 *   - Duminică/Sâmbătă: dezlegare_peste
 *   - Miercuri/Vineri: post_aspru
 *   - Luni/Marți/Joi: dezlegare_ulei
 *   - 24 Iunie (Nașterea Sf. Ioan Botezătorul): dezlegare_peste
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY lipsește!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// Badge-uri corecte pentru 1-7 iunie 2026
// Verificate manual: 1 Iunie = Luni, 7 Iunie = Duminică
const CORECTII = [
  { data: '2026-06-01', zi: 'Luni',     tip_post: 'dezlegare_ulei',  sfant: 'Sfântul Iustin Filozoful și Mucenic; Sfântul Mucenic Iustin cel Nou' },
  { data: '2026-06-02', zi: 'Marți',    tip_post: 'dezlegare_ulei',  sfant: null }, // păstrăm sfântul existent
  { data: '2026-06-03', zi: 'Miercuri', tip_post: 'post_aspru',      sfant: null },
  { data: '2026-06-04', zi: 'Joi',      tip_post: 'dezlegare_ulei',  sfant: null },
  { data: '2026-06-05', zi: 'Vineri',   tip_post: 'post_aspru',      sfant: null },
  { data: '2026-06-06', zi: 'Sâmbătă',  tip_post: 'dezlegare_peste', sfant: null },
  { data: '2026-06-07', zi: 'Duminică', tip_post: 'dezlegare_peste', sfant: null },
];

async function corecteazaBadguri() {
  console.log('✝️  Corectare badge-uri post pentru 1-7 iunie 2026 (Postul Apostolilor)');
  console.log('================================================================');
  
  for (const corectie of CORECTII) {
    // Verifică valoarea curentă
    const { data: existent } = await supabase
      .from('zile_ortodoxe')
      .select('data_calendaristica, sfant_nume, tip_post')
      .eq('data_calendaristica', corectie.data)
      .single();
    
    if (!existent) {
      console.log(`⚠️  ${corectie.data}: Nu există în Supabase — skip`);
      continue;
    }
    
    console.log(`\n📅 ${corectie.data} (${corectie.zi}):`);
    console.log(`   Curent: ${existent.tip_post} → Corect: ${corectie.tip_post}`);
    
    if (existent.tip_post === corectie.tip_post) {
      console.log(`   ✅ Badge deja corect — skip`);
      continue;
    }
    
    // Actualizează badge-ul
    const updateData = { tip_post: corectie.tip_post };
    
    const { error } = await supabase
      .from('zile_ortodoxe')
      .update(updateData)
      .eq('data_calendaristica', corectie.data);
    
    if (error) {
      console.error(`   ❌ Eroare la actualizare: ${error.message}`);
    } else {
      console.log(`   ✅ Actualizat: ${existent.tip_post} → ${corectie.tip_post}`);
    }
  }
  
  console.log('\n✅ Corectare completă!');
  
  // Verificare finală
  console.log('\n📊 Verificare finală badge-uri 1-7 iunie 2026:');
  const { data: verificare } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, sfant_nume, tip_post')
    .gte('data_calendaristica', '2026-06-01')
    .lte('data_calendaristica', '2026-06-07')
    .order('data_calendaristica');
  
  if (verificare) {
    const days = ['Dum','Lun','Mar','Mie','Joi','Vin','Sâm'];
    for (const row of verificare) {
      const d = new Date(row.data_calendaristica + 'T12:00:00');
      const zi = days[d.getDay()];
      const status = ['dezlegare_ulei', 'post_aspru', 'dezlegare_peste'].includes(row.tip_post) ? '✅' : '❌';
      console.log(`   ${status} ${row.data_calendaristica} (${zi}): ${row.tip_post} — ${row.sfant_nume?.substring(0, 40)}`);
    }
  }
}

corecteazaBadguri().catch(err => {
  console.error('❌ Eroare fatală:', err);
  process.exit(1);
});
